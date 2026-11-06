from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic

# Asegúrate de importar tu modelo y tu función get_db
from models import PasswordHistorial
from config.db import get_db

# 1. Instanciamos el APIRouter en lugar de FastAPI()
router = APIRouter(
    prefix="/password_historial", # Esto añade "/password_historial" a todas las rutas automáticamente
    tags=["password_historial"]   # Esto agrupa las rutas en la documentación de Swagger
)

PasswordHistorialResponse = sqlalchemy_to_pydantic(PasswordHistorial)
PasswordHistorialCreate = sqlalchemy_to_pydantic(PasswordHistorial, exclude={"id"})

@router.get("/", response_model=List[PasswordHistorialResponse])
def read_password_histories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    password_histories = db.query(PasswordHistorial).offset(skip).limit(limit).all()
    return password_histories

@router.post("/", response_model=PasswordHistorialResponse)
def create_password_history(password_history: PasswordHistorialCreate, db: Session = Depends(get_db)):
    db_password_history = PasswordHistorial(**password_history.dict())
    db.add(db_password_history)
    db.commit()
    db.refresh(db_password_history)
    return db_password_history


@router.patch("/{password_history_id}", response_model=PasswordHistorialResponse)
def update_password_history(password_history_id: int, password_history: PasswordHistorialCreate, db: Session = Depends(get_db)):
    db_password_history = db.query(PasswordHistorial).filter(PasswordHistorial.id == password_history_id).first()
    if db_password_history is None:
        raise HTTPException(status_code=404, detail="Password history not found")
    
    for key, value in password_history.dict(exclude_unset=True).items():
        setattr(db_password_history, key, value)
    
    db.commit()
    db.refresh(db_password_history)
    return db_password_history

@router.delete("/{password_history_id}")
def delete_password_history(password_history_id: int, db: Session = Depends(get_db)):
    db_password_history = db.query(PasswordHistorial).filter(PasswordHistorial.id == password_history_id).first()
    if db_password_history is None:
        raise HTTPException(status_code=404, detail="Password history not found")
    
    db.delete(db_password_history)
    db.commit()
    return {"detail": "Password history deleted"}

