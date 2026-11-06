from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import Materia
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/materia", tags=["materia"])

MateriaResponse = sqlalchemy_to_pydantic(Materia)
MateriaCreate = sqlalchemy_to_pydantic(Materia, exclude={"id"})

@router.get("/", response_model=List[MateriaResponse])
async def get_materia(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(Materia).filter(Materia.state == True).all() 
    registrar_auditoria(db, usuario_id, "LEER", "materia", None, None, request.client.host)
    return result

@router.post("/", response_model=MateriaResponse)
async def create_materia(request: Request, materia_input: MateriaCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        nueva_materia = Materia(**materia_input.model_dump()) 
        db.add(nueva_materia)
        db.commit()
        db.refresh(nueva_materia)
        
        datos_nuevos = preparar_datos_auditoria(materia_input.model_dump())
        registrar_auditoria(db, usuario_id, "CREAR", "materia", None, datos_nuevos, request.client.host)
        return nueva_materia

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router.patch("/{materia_id}", response_model=MateriaResponse)
async def update_materia(request: Request, materia_id: int, materia_input: MateriaCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_materia = db.query(Materia).filter(Materia.id == materia_id, Materia.state == True).first()
    if existing_materia is None:
        raise HTTPException(status_code=404, detail="Materia no encontrada o eliminada")
    
    valor_anterior = preparar_datos_auditoria(existing_materia)
    update_data_raw = materia_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_materia, key, value)
        
    db.commit()
    db.refresh(existing_materia)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "materia", valor_anterior, update_data, request.client.host)
    return existing_materia

@router.delete("/{materia_id}")
async def delete_materia(request: Request, materia_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    materia = db.query(Materia).filter(Materia.id == materia_id, Materia.state == True).first()
    if materia is None:
        raise HTTPException(status_code=404, detail="Materia no encontrada o eliminada")
    
    valor_anterior = preparar_datos_auditoria(materia)
    materia.state = False
    db.commit()
    db.refresh(materia)
    
    valor_nuevo = preparar_datos_auditoria(materia)
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "materia", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "Materia eliminada lógicamente"}