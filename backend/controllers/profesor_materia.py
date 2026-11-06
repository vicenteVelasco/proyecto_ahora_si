from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import ProfesorMateriaCurso
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/profesor_materia_curso", tags=["profesor_materia_curso"])

ProfesorMateriaCursoResponse = sqlalchemy_to_pydantic(ProfesorMateriaCurso)
ProfesorMateriaCursoCreate = sqlalchemy_to_pydantic(ProfesorMateriaCurso, exclude={"id"})

@router.get("/", response_model=List[ProfesorMateriaCursoResponse])
async def get_profesor_materia(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(ProfesorMateriaCurso).filter(ProfesorMateriaCurso.state == True).all() 
    registrar_auditoria(db, usuario_id, "LEER", "profesor_materia_curso", None, None, request.client.host)
    return result

@router.post("/", response_model=ProfesorMateriaCursoResponse)
async def create_profesor_materia(request: Request, pmc_input: ProfesorMateriaCursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        nuevo_pmc = ProfesorMateriaCurso(**pmc_input.model_dump()) 
        db.add(nuevo_pmc)
        db.commit()
        db.refresh(nuevo_pmc)
        
        datos_nuevos = preparar_datos_auditoria(pmc_input.model_dump())
        registrar_auditoria(db, usuario_id, "CREAR", "profesor_materia_curso", None, datos_nuevos, request.client.host)
        return nuevo_pmc

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error: Verifica que los IDs existan.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router.patch("/{pmc_id}", response_model=ProfesorMateriaCursoResponse)
async def update_profesor_materia(request: Request, pmc_id: int, pmc_input: ProfesorMateriaCursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_pmc = db.query(ProfesorMateriaCurso).filter(ProfesorMateriaCurso.id == pmc_id, ProfesorMateriaCurso.state == True).first()
    if existing_pmc is None:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    
    valor_anterior = preparar_datos_auditoria(existing_pmc)
    update_data_raw = pmc_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_pmc, key, value)
        
    db.commit()
    db.refresh(existing_pmc)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "profesor_materia_curso", valor_anterior, update_data, request.client.host)
    return existing_pmc

@router.delete("/{pmc_id}")
async def delete_profesor_materia(request: Request, pmc_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    pmc = db.query(ProfesorMateriaCurso).filter(ProfesorMateriaCurso.id == pmc_id, ProfesorMateriaCurso.state == True).first()
    if pmc is None:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    
    valor_anterior = preparar_datos_auditoria(pmc)
    pmc.state = False
    db.commit()
    db.refresh(pmc)
    
    valor_nuevo = preparar_datos_auditoria(pmc)
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "profesor_materia_curso", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "Asignación eliminada lógicamente"}