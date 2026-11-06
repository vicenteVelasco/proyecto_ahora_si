from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import EstudianteCurso, Curso
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/estudiante_curso", tags=["estudiante_curso"])

EstudianteCursoResponse = sqlalchemy_to_pydantic(EstudianteCurso)
EstudianteCursoCreate = sqlalchemy_to_pydantic(EstudianteCurso, exclude={"id"})


@router.get("/mi-curso")
async def get_mi_curso(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    if usuario_id == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    inscripcion = (
        db.query(EstudianteCurso)
        .filter(EstudianteCurso.estudiante_id == usuario_id)
        .filter(EstudianteCurso.state == True)
        .order_by(EstudianteCurso.id.desc())
        .first()
    )
    if not inscripcion:
        raise HTTPException(status_code=404, detail="No se encontró curso asignado")
    curso = db.query(Curso).filter(Curso.id == inscripcion.curso_id).first()
    if not curso or getattr(curso, "state", True) is False:
        raise HTTPException(status_code=404, detail="No se encontró curso asignado")
    return {
        "id": curso.id,
        "anio": getattr(curso, "año", getattr(curso, "anio")),
        "seccion": curso.seccion,
        "turno": curso.turno,
        "anio_escolar": getattr(curso, "año_escolar", getattr(curso, "anio_escolar")),
        "fecha_inscripcion": str(inscripcion.fecha_inscripcion) if getattr(inscripcion, "fecha_inscripcion") else None,
    }


@router.get("/", response_model=List[EstudianteCursoResponse])
async def get_estudiante_curso(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(EstudianteCurso).filter(EstudianteCurso.state == True).all() 
    try:
        registrar_auditoria(db, usuario_id, "LEER", "estudiante_curso", None, None, request.client.host)
    except Exception:
        pass
    return result

@router.post("/", response_model=EstudianteCursoResponse)
async def create_estudiante_curso(request: Request, estudiante_curso_input: EstudianteCursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        nuevo_estudiante_curso = EstudianteCurso(**estudiante_curso_input.model_dump()) 
        db.add(nuevo_estudiante_curso)
        db.commit()
        db.refresh(nuevo_estudiante_curso)
        
        # CAMBIO CLAVE: Usamos preparar_datos_auditoria para limpiar las fechas a texto plano
        datos_nuevos = preparar_datos_auditoria(estudiante_curso_input.model_dump())
        registrar_auditoria(db, usuario_id, "CREAR", "estudiante_curso", None, datos_nuevos, request.client.host)
        
        return nuevo_estudiante_curso

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estudiante_id o el curso_id proporcionado no existe en la base de datos."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.patch("/{estudiante_curso_id}", response_model=EstudianteCursoResponse)
async def update_estudiante_curso(request: Request, estudiante_curso_id: int, estudiante_curso_input: EstudianteCursoCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_estudiante_curso = db.query(EstudianteCurso).filter(EstudianteCurso.id == estudiante_curso_id, EstudianteCurso.state == True).first()
    if existing_estudiante_curso is None:
        raise HTTPException(status_code=404, detail="EstudianteCurso not found o ya eliminado")
    
    # CAMBIO CLAVE: Limpiamos el valor anterior con fechas convertidas a texto
    valor_anterior = preparar_datos_auditoria(existing_estudiante_curso)
    
    update_data_raw = estudiante_curso_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_estudiante_curso, key, value)
        
    db.commit()
    db.refresh(existing_estudiante_curso)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "estudiante_curso", valor_anterior, update_data, request.client.host)
    return existing_estudiante_curso

@router.delete("/{estudiante_curso_id}")
async def delete_estudiante_curso(request: Request, estudiante_curso_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    estudiante_curso = db.query(EstudianteCurso).filter(EstudianteCurso.id == estudiante_curso_id, EstudianteCurso.state == True).first()
    if estudiante_curso is None:
        raise HTTPException(status_code=404, detail="EstudianteCurso not found o ya eliminado")
    
    # CAMBIO CLAVE: Limpiamos el valor anterior antes del borrado
    valor_anterior = preparar_datos_auditoria(estudiante_curso)
    
    estudiante_curso.state = False
    db.commit()
    db.refresh(estudiante_curso)
    
    # CAMBIO CLAVE: Limpiamos el valor nuevo con el state en False
    valor_nuevo = preparar_datos_auditoria(estudiante_curso)
    
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "estudiante_curso", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "EstudianteCurso eliminado lógicamente"}