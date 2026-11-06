from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError
from decimal import Decimal

from models import NotaFinal, Evaluacion, NotaEvaluacion
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

router = APIRouter(prefix="/nota_final", tags=["nota_final"])

NotaFinalResponse = sqlalchemy_to_pydantic(NotaFinal)
NotaFinalCreate = sqlalchemy_to_pydantic(NotaFinal, exclude={"id"})


def calcular_nota_final(db: Session, estudiante_id: int, materia_id: int, curso_id: int) -> float:
    """Calcula la nota final como promedio ponderado de las evaluaciones."""
    evaluaciones = db.query(Evaluacion).filter(
        Evaluacion.materia_id == materia_id,
        Evaluacion.curso_id == curso_id,
        Evaluacion.state == True
    ).all()

    if not evaluaciones:
        return 0.0

    suma_ponderada = Decimal('0')
    suma_porcentajes = Decimal('0')

    for evaluacion in evaluaciones:
        nota = db.query(NotaEvaluacion).filter(
            NotaEvaluacion.estudiante_id == estudiante_id,
            NotaEvaluacion.evaluacion_id == evaluacion.id,
            NotaEvaluacion.state == True
        ).first()

        if nota:
            suma_ponderada += Decimal(str(nota.nota)) * Decimal(str(evaluacion.porcentaje))
            suma_porcentajes += Decimal(str(evaluacion.porcentaje))

    if suma_porcentajes == 0:
        return 0.0

    return float(suma_ponderada / suma_porcentajes)


@router.get("/", response_model=List[NotaFinalResponse])
async def get_notas_finales(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(NotaFinal).filter(NotaFinal.state == True).all()
    registrar_auditoria(db, usuario_id, "LEER", "nota_final", None, None, request.client.host)
    return result


@router.get("/{nota_final_id}", response_model=NotaFinalResponse)
async def get_nota_final(nota_final_id: int, request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    nota_final = db.query(NotaFinal).filter(NotaFinal.id == nota_final_id, NotaFinal.state == True).first()
    if not nota_final:
        raise HTTPException(status_code=404, detail="Nota final no encontrada")
    registrar_auditoria(db, usuario_id, "LEER", "nota_final", None, None, request.client.host)
    return nota_final


@router.get("/estudiante/{estudiante_id}/materia/{materia_id}/curso/{curso_id}", response_model=NotaFinalResponse)
async def get_nota_final_by_estudiante_materia(
    estudiante_id: int,
    materia_id: int,
    curso_id: int,
    request: Request,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_current_user_id)
):
    nota_final = db.query(NotaFinal).filter(
        NotaFinal.estudiante_id == estudiante_id,
        NotaFinal.materia_id == materia_id,
        NotaFinal.curso_id == curso_id,
        NotaFinal.state == True
    ).first()
    if not nota_final:
        raise HTTPException(status_code=404, detail="Nota final no encontrada")
    registrar_auditoria(db, usuario_id, "LEER", "nota_final", None, None, request.client.host)
    return nota_final


@router.post("/", response_model=NotaFinalResponse)
async def create_nota_final(request: Request, nota_input: NotaFinalCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        # Calcular la nota final automáticamente
        nota_calculada = calcular_nota_final(db, nota_input.estudiante_id, nota_input.materia_id, nota_input.curso_id)

        nueva_nota_final = NotaFinal(
            estudiante_id=nota_input.estudiante_id,
            materia_id=nota_input.materia_id,
            curso_id=nota_input.curso_id,
            nota_final=nota_calculada,
            state=True
        )
        db.add(nueva_nota_final)
        db.commit()
        db.refresh(nueva_nota_final)

        datos_nuevos = preparar_datos_auditoria(nueva_nota_final)
        registrar_auditoria(db, usuario_id, "CREAR", "nota_final", None, datos_nuevos, request.client.host)
        return nueva_nota_final

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una nota final para este estudiante, materia y curso.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")


@router.post("/calcular/{estudiante_id}/materia/{materia_id}/curso/{curso_id}", response_model=NotaFinalResponse)
async def calcular_y_actualizar_nota_final(
    estudiante_id: int,
    materia_id: int,
    curso_id: int,
    request: Request,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_current_user_id)
):
    """Calcula la nota final y la actualiza en la BD (o la crea si no existe)."""
    nota_calculada = calcular_nota_final(db, estudiante_id, materia_id, curso_id)

    nota_final_existente = db.query(NotaFinal).filter(
        NotaFinal.estudiante_id == estudiante_id,
        NotaFinal.materia_id == materia_id,
        NotaFinal.curso_id == curso_id,
        NotaFinal.state == True
    ).first()

    if nota_final_existente:
        valor_anterior = preparar_datos_auditoria(nota_final_existente)
        nota_final_existente.nota_final = nota_calculada
        db.commit()
        db.refresh(nota_final_existente)
        registrar_auditoria(db, usuario_id, "EDITAR", "nota_final", valor_anterior, preparar_datos_auditoria(nota_final_existente), request.client.host)
        return nota_final_existente
    else:
        nueva_nota_final = NotaFinal(
            estudiante_id=estudiante_id,
            materia_id=materia_id,
            curso_id=curso_id,
            nota_final=nota_calculada,
            state=True
        )
        db.add(nueva_nota_final)
        db.commit()
        db.refresh(nueva_nota_final)
        registrar_auditoria(db, usuario_id, "CREAR", "nota_final", None, preparar_datos_auditoria(nueva_nota_final), request.client.host)
        return nueva_nota_final


@router.patch("/{nota_final_id}", response_model=NotaFinalResponse)
async def update_nota_final(request: Request, nota_final_id: int, nota_input: NotaFinalCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_nota_final = db.query(NotaFinal).filter(NotaFinal.id == nota_final_id, NotaFinal.state == True).first()
    if existing_nota_final is None:
        raise HTTPException(status_code=404, detail="Nota final no encontrada")

    valor_anterior = preparar_datos_auditoria(existing_nota_final)
    update_data_raw = nota_input.model_dump(exclude_unset=True)
    update_data = preparar_datos_auditoria(update_data_raw)

    for key, value in update_data_raw.items():
        setattr(existing_nota_final, key, value)

    db.commit()
    db.refresh(existing_nota_final)
    registrar_auditoria(db, usuario_id, "EDITAR", "nota_final", valor_anterior, update_data, request.client.host)
    return existing_nota_final


@router.delete("/{nota_final_id}")
async def delete_nota_final(request: Request, nota_final_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    nota_final = db.query(NotaFinal).filter(NotaFinal.id == nota_final_id, NotaFinal.state == True).first()
    if nota_final is None:
        raise HTTPException(status_code=404, detail="Nota final no encontrada")

    valor_anterior = preparar_datos_auditoria(nota_final)
    nota_final.state = False
    db.commit()
    db.refresh(nota_final)

    valor_nuevo = preparar_datos_auditoria(nota_final)
    registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "nota_final", valor_anterior, valor_nuevo, request.client.host)
    return {"message": "Nota final eliminada lógicamente"}
