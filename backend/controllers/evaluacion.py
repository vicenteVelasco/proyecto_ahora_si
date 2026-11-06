from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import Evaluacion
from config.db import get_db
from utils.auditoria_service import registrar_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/evaluacion", tags=["evaluacion"])

EvaluacionResponse = sqlalchemy_to_pydantic(Evaluacion)
EvaluacionCreate = sqlalchemy_to_pydantic(Evaluacion, exclude={"id"})

@router.get("/", response_model=List[EvaluacionResponse])
async def read_evaluaciones(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    evaluaciones = db.query(Evaluacion).filter(Evaluacion.state == True).offset(skip).limit(limit).all()
    registrar_auditoria(db, usuario_id, "LEER", "evaluacion", None, None, request.client.host)
    return evaluaciones   

@router.post("/", response_model=EvaluacionResponse)
async def create_evaluacion(request: Request, evaluacion: EvaluacionCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try: 
        db_evaluacion = Evaluacion(**evaluacion.dict())
        db.add(db_evaluacion)
        db.commit()
        db.refresh(db_evaluacion)
        registrar_auditoria(db, usuario_id, "CREAR", "evaluacion", None, evaluacion.dict(), request.client.host)
        return db_evaluacion 
        
    except IntegrityError as e:
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error en la base de datos: {str(e.orig)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.patch("/{evaluacion_id}", response_model=EvaluacionResponse)
async def update_evaluacion(request: Request, evaluacion_id: int, evaluacion: EvaluacionCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    db_evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id, Evaluacion.state == True).first()
    if db_evaluacion is None:
        raise HTTPException(status_code=404, detail="Evaluacion not found o eliminada")
    
    valor_anterior = {c.name: getattr(db_evaluacion, c.name) for c in db_evaluacion.__table__.columns}
    update_data = evaluacion.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_evaluacion, key, value)
    
    db.commit()
    db.refresh(db_evaluacion)
    registrar_auditoria(db, usuario_id, "EDITAR", "evaluacion", valor_anterior, update_data, request.client.host)
    return db_evaluacion

@router.delete("/{evaluacion_id}")
async def delete_evaluacion(request: Request, evaluacion_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    db_evaluacion = db.query(Evaluacion).filter(Evaluacion.id == evaluacion_id, Evaluacion.state == True).first()
    if db_evaluacion is None:
        raise HTTPException(status_code=404, detail="Evaluacion not found o eliminada")
    
    valor_anterior = {c.name: getattr(db_evaluacion, c.name) for c in db_evaluacion.__table__.columns}
    db_evaluacion.state = False
    db.commit()
    db.refresh(db_evaluacion)
    
    valor_nuevo = {c.name: getattr(db_evaluacion, c.name) for c in db_evaluacion.__table__.columns}
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "evaluacion", valor_anterior, valor_nuevo, request.client.host)
    return {"detail": "Evaluacion eliminada lógicamente"}