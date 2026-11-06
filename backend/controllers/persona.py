from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from models import Persona
from config.db import get_db
from utils.auditoria_service import registrar_auditoria, preparar_datos_auditoria
from utils.auth import get_current_user_id

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verificar_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def crear_token_acceso(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

router = APIRouter(prefix="/persona", tags=["persona"])

class LoginData(BaseModel):
    email: str
    password: str

PersonaResponse = sqlalchemy_to_pydantic(Persona, exclude={"password_hash"})
PersonaCreate = sqlalchemy_to_pydantic(Persona, exclude={"id"})

@router.post("/login")
def login(datos: LoginData, response: Response, request: Request, db: Session = Depends(get_db)):
    usuario = db.query(Persona).filter(Persona.email == datos.email).first()
    if not usuario or not getattr(usuario, "activo", True) or not getattr(usuario, "state", True):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    tiempo_expiracion = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_jwt = crear_token_acceso(
        data={"sub": str(usuario.id), "nombre": str(usuario.nombre), "rol": str(usuario.rol), "email": str(usuario.email)}, 
        expires_delta=tiempo_expiracion
    )

    response.set_cookie(
        key="access_token", value=token_jwt, httponly=True, secure=False, samesite="lax", max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    try:
        registrar_auditoria(db, usuario.id, "LOGIN", "persona", None, None, request.client.host)
    except Exception:
        pass
    return {"mensaje": "Inicio de sesión exitoso", "usuario": {"nombre": usuario.nombre, "rol": usuario.rol}}

@router.get("/yo", response_model=PersonaResponse)
async def get_persona_actual(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    if usuario_id == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    persona = db.query(Persona).filter(Persona.id == usuario_id).first()
    if not persona:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    if hasattr(persona, "activo") and not persona.activo:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    if hasattr(persona, "state") and not persona.state:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return persona


@router.get("/", response_model=List[PersonaResponse])
async def get_persona(request: Request, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    result = db.query(Persona).filter(Persona.activo == True).all() if hasattr(Persona, "activo") else db.query(Persona).filter(Persona.state == True).all()
    try:
        registrar_auditoria(db, usuario_id, "LEER", "persona", None, None, request.client.host)
    except Exception:
        pass
    return result

@router.post("/", response_model=PersonaResponse)
async def create_persona(request: Request, persona_input: PersonaCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    try:
        datos_persona = persona_input.model_dump()
        datos_persona["password_hash"] = get_password_hash(datos_persona.pop("password_hash", ""))
        
        nueva_persona = Persona(**datos_persona) 
        db.add(nueva_persona)
        db.commit()
        db.refresh(nueva_persona)
        
        datos_nuevos = preparar_datos_auditoria(datos_persona)
        registrar_auditoria(db, usuario_id, "CREAR", "persona", None, datos_nuevos, request.client.host)
        return nueva_persona

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Correo o cédula ya existen.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno: {str(e)}")

@router.patch("/{persona_id}", response_model=PersonaResponse)
async def update_persona(request: Request, persona_id: int, persona_input: PersonaCreate, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    existing_persona = db.query(Persona).filter(Persona.id == persona_id, Persona.activo == True).first()
    if existing_persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada o inactiva")
    
    valor_anterior = preparar_datos_auditoria(existing_persona)
    update_data_raw = persona_input.model_dump(exclude_unset=True)
    if "password_hash" in update_data_raw:
        update_data_raw["password_hash"] = get_password_hash(update_data_raw["password_hash"])
        
    update_data = preparar_datos_auditoria(update_data_raw)
    
    for key, value in update_data_raw.items():
        setattr(existing_persona, key, value)
        
    db.commit()
    db.refresh(existing_persona)
    
    registrar_auditoria(db, usuario_id, "EDITAR", "persona", valor_anterior, update_data, request.client.host)
    return existing_persona

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"mensaje": "Sesión cerrada exitosamente"}


@router.delete("/{persona_id}")
async def delete_persona(request: Request, persona_id: int, db: Session = Depends(get_db), usuario_id: int = Depends(get_current_user_id)):
    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada o ya inactiva")
    
    valor_anterior = preparar_datos_auditoria(persona)
    if hasattr(persona, "activo"):
        persona.activo = False
    if hasattr(persona, "state"):
        persona.state = False
    db.commit()
    db.refresh(persona)
    
    try:
        valor_nuevo = preparar_datos_auditoria(persona)
        registrar_auditoria(db, usuario_id, "ELIMINAR_LOGICO", "persona", valor_anterior, valor_nuevo, request.client.host)
    except Exception:
        pass
    return {"message": "Persona eliminada lógicamente"}