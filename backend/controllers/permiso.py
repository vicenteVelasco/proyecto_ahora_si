from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic

# Asegúrate de importar tu modelo y tu función get_db
from models import Permiso
from config.db import get_db

# 1. Instanciamos el APIRouter en lugar de FastAPI()
router = APIRouter(
    prefix="/permiso", # Esto añade "/permiso" a todas las rutas automáticamente
    tags=["permiso"]   # Esto agrupa las rutas en la documentación de Swagger
)

PermisoResponse = sqlalchemy_to_pydantic(Permiso)
PermisoCreate = sqlalchemy_to_pydantic(Permiso, exclude={"id"})