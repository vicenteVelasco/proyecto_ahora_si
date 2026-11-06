from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic

from models import Curso
from config.db import get_db
from utils.auditoria_service import registrar_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/curso", tags=["curso"])

CursoResponse = sqlalchemy_to_pydantic(Curso)
CursoCreate = sqlalchemy_to_pydantic(Curso, exclude={"id"})

@router.get("/", response_model=List[CursoResponse])
async def get_curso(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(Curso).filter(Curso.state == True).all() 
    registrar_auditoria(db, usuario_id, "LEER", "curso", None, None, request.client.host)
    return result

@router.post("/", response_model=CursoResponse)
async def create_curso(request: Request, curso_input: CursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    nuevo_curso = Curso(**curso_input.model_dump()) 
    db.add(nuevo_curso)
    db.commit()
    db.refresh(nuevo_curso)
    registrar_auditoria(db, usuario_id, "CREAR", "curso", None, curso_input.model_dump(), request.client.host)
    return nuevo_curso

@router.patch("/{curso_id}", response_model=CursoResponse)
async def update_curso(request: Request, curso_id: int, curso_input: CursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    
    # MODIFICACIÓN: Agregamos Curso.activo == True al filtro
    existing_curso = db.query(Curso).filter(Curso.id == curso_id, Curso.state == True).first()
    
    if existing_curso is None:
        raise HTTPException(status_code=404, detail="Curso not found o ya fue eliminado")
    
    # --- El resto queda exactamente igual ---
    valor_anterior = {c.name: getattr(existing_curso, c.name) for c in existing_curso.__table__.columns}
    update_data = curso_input.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(existing_curso, key, value)
        
    db.commit()
    db.refresh(existing_curso)
    registrar_auditoria(db, usuario_id, "EDITAR", "curso", valor_anterior, update_data, request.client.host)
    
    return existing_curso

@router.delete("/{curso_id}")
async def delete_curso(request: Request, curso_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    # Buscamos el curso (asegurándonos de que no haya sido "borrado" antes)
    curso = db.query(Curso).filter(Curso.id == curso_id, Curso.state == True).first()
    if curso is None:
        raise HTTPException(status_code=404, detail="Curso not found o ya fue eliminado")
    
    # Guardamos el estado anterior para la auditoría
    valor_anterior = {c.name: getattr(curso, c.name) for c in curso.__table__.columns}
    
    # MODIFICACIÓN: Borrado lógico. En lugar de db.delete(curso), cambiamos el estado.
    curso.state = False
    
    db.commit()
    db.refresh(curso) # Refrescamos para tener el objeto actualizado

    # Registramos en la auditoría. Para el valor_nuevo, podemos pasar el nuevo estado.
    valor_nuevo = {c.name: getattr(curso, c.name) for c in curso.__table__.columns}
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "curso", valor_anterior, valor_nuevo, request.client.host)
    
    return {"message": "Curso eliminado correctamente (borrado lógico)"}