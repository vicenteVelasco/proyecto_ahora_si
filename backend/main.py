from contextlib import asynccontextmanager
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config.db import create_tables

# Obligamos a SQLAlchemy a leer las tablas y relaciones antes que las rutas
import models
from controllers.cursos import router as cursos_router
from controllers.auditoria import router as auditoria_router
from controllers.estudiante_curso import router as estudiante_curso_router
from controllers.evaluacion import router as evaluacion_router
from controllers.password_historial import router as password_historial_router
from controllers.lapso import router as lapso_router
from controllers.materia import router as materia_router
from controllers.nota_evaluacion import router as nota_evaluacion_router
from controllers.persona import router as persona_router
from controllers.profesor_materia import router as profesor_materia_router
from controllers.nota_final import router as nota_final_router
try:
    from controllers.horario import router as horario_router
except Exception:
    horario_router = None

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()  # Crea las tablas en PostgreSQL si no existen
    yield


app = FastAPI(lifespan=lifespan)

# URLs donde corre el frontend (Vite en desarrollo y Docker en producción)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Estrictamente necesario para que pase la cookie access_token
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cursos_router)
app.include_router(auditoria_router)
app.include_router(estudiante_curso_router)
app.include_router(evaluacion_router)
app.include_router(password_historial_router)
app.include_router(lapso_router)
app.include_router(materia_router)
app.include_router(nota_evaluacion_router)
app.include_router(persona_router)
app.include_router(profesor_materia_router)
app.include_router(nota_final_router)
if horario_router:
    app.include_router(horario_router)

# Serve static files for horarios/images if present
try:
    static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")
except Exception:
    pass


@app.get("/")
async def root():
    return {"message": "Hello World"}
