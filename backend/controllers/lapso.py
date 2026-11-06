from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import Lapso
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/lapso", tags=["lapso"])

LapsoResponse = sqlalchemy_to_pydantic(Lapso)
LapsoCreate = sqlalchemy_to_pydantic(Lapso, exclude={"id"})

@router.get("/", response_model=List[LapsoResponse])
async def get_lapso(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(Lapso).filter(Lapso.state == True).all() 
    registrar_auditoria(db, usuario_id, "LEER", "lapso", None, None, request.client.host)
    return result

@router.post("/", response_model=LapsoResponse)
async def create_lapso(request: Request, lapso_input: LapsoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        nuevo_lapso = Lapso(**lapso_input.model_dump()) 
        db.add(nuevo_lapso)
        db.commit()
        db.refresh(nuevo_lapso)
        
        datos_nuevos = preparar_datos_auditoria(lapso_input.model_dump())
        registrar_auditoria(db, usuario_id, "CREAR", "lapso", None, datos_nuevos, request.client.host)
        return nuevo_lapso

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad. Datos duplicados o inválidos.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router.patch("/{lapso_id}", response_model=LapsoResponse)
async def update_lapso(request: Request, lapso_id: int, lapso_input: LapsoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_lapso = db.query(Lapso).filter(Lapso.id == lapso_id, Lapso.state == True).first()
    if existing_lapso is None:
        raise HTTPException(status_code=404, detail="Lapso no encontrado o eliminado")
    
    valor_anterior = preparar_datos_auditoria(existing_lapso)
    update_data_raw = lapso_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_lapso, key, value)
        
    db.commit()
    db.refresh(existing_lapso)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "lapso", valor_anterior, update_data, request.client.host)
    return existing_lapso

@router.delete("/{lapso_id}")
async def delete_lapso(request: Request, lapso_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    lapso = db.query(Lapso).filter(Lapso.id == lapso_id, Lapso.state == True).first()
    if lapso is None:
        raise HTTPException(status_code=404, detail="Lapso no encontrado o eliminado")
    
    valor_anterior = preparar_datos_auditoria(lapso)
    lapso.state = False
    db.commit()
    db.refresh(lapso)
    
    valor_nuevo = preparar_datos_auditoria(lapso)
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "lapso", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "Lapso eliminado lógicamente"}