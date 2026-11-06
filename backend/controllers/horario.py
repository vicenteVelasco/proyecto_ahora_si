from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
import os

from models import EstudianteCurso, Curso
from config.db import get_db
from utils.auth import get_current_user_id

router = APIRouter(prefix="/horario", tags=["horario"])


@router.get("/mi-curso")
async def get_mi_horario(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    if usuario_id == 0:
        raise HTTPException(status_code=401, detail="No autenticado")
    inscripcion = (
        db.query(EstudianteCurso)
        .filter(EstudianteCurso.estudiante_id == usuario_id)
        .filter(EstudianteCurso.state == True)
        .order_by(EstudianteCurso.id.desc())
        .first()
    )
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    curso = db.query(Curso).filter(Curso.id == inscripcion.curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    # Try common static paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_dir = os.path.join(base_dir, "static", "horarios")
    candidates = []
    try:
        if os.path.exists(static_dir):
            for f in os.listdir(static_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.svg')):
                    candidates.append(f)
    except Exception:
        pass
    # Prefer course-specific if exists
    imagen_url = None
    for c in candidates:
        if str(curso.id) in c or (getattr(curso, 'seccion') and curso.seccion in c):
            imagen_url = f"/static/horarios/{c}"
            break
    if not imagen_url and candidates:
        imagen_url = f"/static/horarios/{candidates[0]}"
    if not imagen_url:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return {"curso_id": curso.id, "imagen_url": imagen_url, "actualizado_en": None}
