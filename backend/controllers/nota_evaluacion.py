from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError

from models import NotaEvaluacion, Evaluacion, Materia, Lapso, EstudianteCurso, Curso
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/nota_evaluacion", tags=["nota_evaluacion"])

NotaEvaluacionResponse = sqlalchemy_to_pydantic(NotaEvaluacion)
NotaEvaluacionCreate = sqlalchemy_to_pydantic(NotaEvaluacion, exclude={"id"})


@router.get("/mis-notas")
async def get_mis_notas(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
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
        return {"anio_escolar": None, "lapso_actual": 1, "evaluaciones": []}

    curso = db.query(Curso).filter(Curso.id == inscripcion.curso_id).first()
    anio_escolar = getattr(curso, "año_escolar", getattr(curso, "anio_escolar")) if curso else None

    # Determine current lapso by date if possible
    lapso_actual = 1
    try:
        lapsos = db.query(Lapso).filter(Lapso.state == True).all()
        hoy = __import__('datetime').date.today()
        for l in lapsos:
            try:
                if l.fecha_inicio and l.fecha_fin and l.fecha_inicio <= hoy <= l.fecha_fin:
                    lapso_actual = l.numero
                    break
                elif l.fecha_inicio and not l.fecha_fin and hoy >= l.fecha_inicio:
                    lapso_actual = max(lapso_actual, l.numero)
                elif not l.fecha_inicio and l.fecha_fin and hoy <= l.fecha_fin:
                    lapso_actual = max(lapso_actual, l.numero)
            except Exception:
                continue
    except Exception:
        lapso_actual = 1

    notas = (
        db.query(NotaEvaluacion)
        .filter(NotaEvaluacion.estudiante_id == usuario_id)
        .filter(NotaEvaluacion.state == True)
        .all()
    )

    evaluaciones = []
    for n in notas:
        ev = db.query(Evaluacion).filter(Evaluacion.id == n.evaluacion_id).first()
        if not ev or getattr(ev, "state", True) is False:
            continue
        mat = db.query(Materia).filter(Materia.id == ev.materia_id).first()
        lap = db.query(Lapso).filter(Lapso.id == ev.lapso_id).first()
        evaluaciones.append({
            "evaluacion_id": ev.id,
            "materia_id": ev.materia_id,
            "materia": mat.nombre if mat else "",
            "lapso": lap.numero if lap else 1,
            "nombre": ev.nombre,
            "porcentaje": float(ev.porcentaje) if ev.porcentaje is not None else 0,
            "fecha": str(ev.fecha) if ev.fecha else None,
            "nota": float(n.nota) if n.nota is not None else None,
            "observacion": n.observacion,
        })

    return {"anio_escolar": anio_escolar, "lapso_actual": lapso_actual, "evaluaciones": evaluaciones}


@router.get("/", response_model=List[NotaEvaluacionResponse])
async def get_nota_evaluacion(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(NotaEvaluacion).filter(NotaEvaluacion.state == True).all() 
    try:
        registrar_auditoria(db, usuario_id, "LEER", "nota_evaluacion", None, None, request.client.host)
    except Exception:
        pass
    return result

@router.post("/", response_model=NotaEvaluacionResponse)
async def create_nota_evaluacion(request: Request, nota_input: NotaEvaluacionCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        nueva_nota = NotaEvaluacion(**nota_input.model_dump()) 
        db.add(nueva_nota)
        db.commit()
        db.refresh(nueva_nota)
        
        datos_nuevos = preparar_datos_auditoria(nota_input.model_dump())
        registrar_auditoria(db, usuario_id, "CREAR", "nota_evaluacion", None, datos_nuevos, request.client.host)
        return nueva_nota

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad. Verifica relaciones.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router.patch("/{nota_id}", response_model=NotaEvaluacionResponse)
async def update_nota_evaluacion(request: Request, nota_id: int, nota_input: NotaEvaluacionCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_nota = db.query(NotaEvaluacion).filter(NotaEvaluacion.id == nota_id, NotaEvaluacion.state == True).first()
    if existing_nota is None:
        raise HTTPException(status_code=404, detail="Nota no encontrada o eliminada")
    
    valor_anterior = preparar_datos_auditoria(existing_nota)
    update_data_raw = nota_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_nota, key, value)
        
    db.commit()
    db.refresh(existing_nota)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "nota_evaluacion", valor_anterior, update_data, request.client.host)
    return existing_nota

@router.delete("/{nota_id}")
async def delete_nota_evaluacion(request: Request, nota_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    nota = db.query(NotaEvaluacion).filter(NotaEvaluacion.id == nota_id, NotaEvaluacion.state == True).first()
    if nota is None:
        raise HTTPException(status_code=404, detail="Nota no encontrada o eliminada")
    
    valor_anterior = preparar_datos_auditoria(nota)
    nota.state = False
    db.commit()
    db.refresh(nota)
    
    valor_nuevo = preparar_datos_auditoria(nota)
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "nota_evaluacion", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "Nota eliminada lógicamente"}