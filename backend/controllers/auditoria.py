from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic

from models import Auditoria
from config.db import get_db
from utils.auth import get_current_user_id
from utils.auditoria_service import registrar_auditoria

router = APIRouter(prefix="/auditoria", tags=["auditoria"])
AuditoriaResponse = sqlalchemy_to_pydantic(Auditoria)

@router.get("/", response_model=List[AuditoriaResponse])
async def get_auditoria(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(Auditoria).order_by(Auditoria.fecha_hora.desc()).all()
    registrar_auditoria(db, usuario_id, "LEER", "auditoria", None, None, request.client.host)
    return result
