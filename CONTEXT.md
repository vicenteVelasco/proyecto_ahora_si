# 📋 Contexto General del Proyecto

## 1. Descripción General
- **Nombre del proyecto:** Sistema de Gestión Escolar (Liceo)
- **¿Qué hace / qué problema resuelve?** Sistema integral para la gestión académica de un liceo: control de estudiantes, profesores, materias, cursos, evaluaciones y notas. Incluye auditoría de acciones y control de acceso basado en roles.
- **Usuarios / audiencia:** Personal administrativo del liceo (dirección, control de estudio), profesores y estudiantes.
- **Estado actual:** MVP en desarrollo — backend funcional con API REST completa, frontend en etapa inicial (solo página de bienvenida).

## 2. Stack Tecnológico
| Capa | Tecnología | Versión |
|---|---|---|
| Backend | FastAPI | 0.115+ |
| Frontend | React Router + React | 8 / 19 |
| Base de datos | PostgreSQL | 15 |
| ORM | SQLAlchemy | 2.x |
| Cache / colas | — | — |
| Infraestructura / hosting | Docker + Docker Compose | — |
| Gestor de paquetes | pip (backend) / npm (frontend) | — |
| Lenguaje backend | Python | 3.11 |
| Lenguaje frontend | TypeScript | 5.9 |
| Estilos | Tailwind CSS | 4.x |
| Build frontend | Vite | 8.x |

## 3. Arquitectura
- **Patrón:** Monolito modular (backend con routers por entidad, frontend con React Router)
- **Comunicación frontend–backend:** REST API con autenticación JWT en cookies httpOnly
- **Diagrama simple (texto):**
```
[Frontend React Router :3000] --HTTP/REST + Cookies--> [Backend FastAPI :8000] --SQLAlchemy/ORM--> [PostgreSQL :5432]
```

## 4. Estructura de Carpetas
```
/proyecto ahora si
├── backend/
│   ├── config/
│   │   └── db.py              # Engine, SessionLocal, Base, get_db, create_tables
│   ├── controllers/           # Routers de FastAPI (uno por entidad)
│   │   ├── auditoria.py
│   │   ├── cursos.py
│   │   ├── estudiante_curso.py
│   │   ├── evaluacion.py
│   │   ├── lapso.py
│   │   ├── materia.py
│   │   ├── nota_evaluacion.py
│   │   ├── nota_final.py
│   │   ├── password_historial.py
│   │   ├── permiso.py
│   │   ├── persona.py
│   │   └── profesor_materia.py
│   ├── utils/
│   │   ├── auditoria_service.py
│   │   ├── auth.py
│   │   └── types.py
│   ├── models.py              # Modelos SQLAlchemy (todas las entidades)
│   ├── main.py                # App FastAPI, middleware CORS, include_router
│   ├── requirements.txt
│   ├── dockerfile
│   └── .env
├── flonten_clablon_biacho/    # Frontend React Router
│   ├── app/
│   │   ├── routes/            # Rutas de React Router
│   │   ├── welcome/           # Componente de bienvenida
│   │   ├── root.tsx           # Layout raíz
│   │   ├── routes.ts          # Configuración de rutas
│   │   └── app.css
│   ├── src/
│   │   └── services/
│   │       └── api.js         # Cliente axios configurado
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── react-router.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
└── docker-compose.yml
```

## 5. Rutas del Backend (API)
| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| GET | / | Mensaje de estado | No |
| POST | /persona/login | Inicio de sesión (devuelve cookie JWT) | No |
| GET | /persona/ | Listar personas | Sí |
| POST | /persona/ | Crear persona | Sí |
| PATCH | /persona/{id} | Actualizar persona | Sí |
| DELETE | /persona/{id} | Eliminar lógicamente persona | Sí |
| GET | /curso/ | Listar cursos | Sí |
| POST | /curso/ | Crear curso | Sí |
| PATCH | /curso/{id} | Actualizar curso | Sí |
| DELETE | /curso/{id} | Eliminar lógicamente curso | Sí |
| GET | /materia/ | Listar materias | Sí |
| POST | /materia/ | Crear materia | Sí |
| PATCH | /materia/{id} | Actualizar materia | Sí |
| DELETE | /materia/{id} | Eliminar lógicamente materia | Sí |
| GET | /lapso/ | Listar lapsos | Sí |
| POST | /lapso/ | Crear lapso | Sí |
| PATCH | /lapso/{id} | Actualizar lapso | Sí |
| DELETE | /lapso/{id} | Eliminar lógicamente lapso | Sí |
| GET | /evaluacion/ | Listar evaluaciones | Sí |
| POST | /evaluacion/ | Crear evaluación | Sí |
| PATCH | /evaluacion/{id} | Actualizar evaluación | Sí |
| DELETE | /evaluacion/{id} | Eliminar lógicamente evaluación | Sí |
| GET | /nota_evaluacion/ | Listar notas | Sí |
| POST | /nota_evaluacion/ | Registrar nota | Sí |
| PATCH | /nota_evaluacion/{id} | Actualizar nota | Sí |
| DELETE | /nota_evaluacion/{id} | Eliminar lógicamente nota | Sí |
| GET | /nota_final/ | Listar notas finales | Sí |
| GET | /nota_final/{id} | Obtener nota final por ID | Sí |
| GET | /nota_final/estudiante/{id}/materia/{id}/curso/{id} | Obtener nota final por estudiante+materia+curso | Sí |
| POST | /nota_final/ | Crear nota final (calcula automáticamente) | Sí |
| POST | /nota_final/calcular/{estudiante_id}/materia/{materia_id}/curso/{curso_id} | Calcular y actualizar nota final | Sí |
| PATCH | /nota_final/{id} | Actualizar nota final | Sí |
| DELETE | /nota_final/{id} | Eliminar lógicamente nota final | Sí |
| GET | /estudiante_curso/ | Listar inscripciones | Sí |
| POST | /estudiante_curso/ | Inscribir estudiante en curso | Sí |
| PATCH | /estudiante_curso/{id} | Actualizar inscripción | Sí |
| DELETE | /estudiante_curso/{id} | Eliminar lógicamente inscripción | Sí |
| GET | /profesor_materia_curso/ | Listar asignaciones profesor-materia-curso | Sí |
| POST | /profesor_materia_curso/ | Asignar profesor a materia en curso | Sí |
| PATCH | /profesor_materia_curso/{id} | Actualizar asignación | Sí |
| DELETE | /profesor_materia_curso/{id} | Eliminar lógicamente asignación | Sí |
| GET | /auditoria/ | Listar registros de auditoría | Sí |
| GET | /password_historial/ | Listar historial de contraseñas | No |
| POST | /password_historial/ | Registrar contraseña en historial | No |
| PATCH | /password_historial/{id} | Actualizar historial | No |
| DELETE | /password_historial/{id} | Eliminar historial (borrado físico) | No |
| GET | /permiso/ | Listar permisos | No |
| POST | /permiso/ | Crear permiso | No |

## 6. Rutas del Frontend
| Ruta | Vista / Componente | Descripción | Acceso |
|---|---|---|---|
| / | `app/routes/home.tsx` → `Welcome` | Página de bienvenida (placeholder) | Público |

> ⚠️ El frontend está en etapa inicial. Solo existe la ruta `/` con el componente de bienvenida de React Router.

## 7. Modelos de Datos / Entidades Principales
- **Persona:** id, cedula (única), nombre, apellido, email (único), password_hash, rol (enum: estudiante/profesor/control_estudio/direccion), activo, fecha_registro, state, preguntas/respuestas de seguridad, fecha_ultimo_password, debe_cambiar_password. Relaciones: Permiso (1:1), PasswordHistorial (1:N), Auditoria (1:N), EstudianteCurso (1:N), ProfesorMateriaCurso (1:N), NotaEvaluacion (1:N como estudiante y 1:N como registrador).
- **Curso:** id, año, seccion, turno, año_escolar, state. Relaciones: EstudianteCurso (1:N), ProfesorMateriaCurso (1:N), Evaluacion (1:N).
- **Materia:** id, nombre, codigo (único), descripcion, state. Relaciones: ProfesorMateriaCurso (1:N), Evaluacion (1:N).
- **Lapso:** id, numero (1-3), año_escolar, fecha_inicio, fecha_fin, state. Relaciones: Evaluacion (1:N).
- **EstudianteCurso:** id, estudiante_id (FK→Persona), curso_id (FK→Curso), fecha_inscripcion, state. UniqueConstraint(estudiante_id, curso_id).
- **ProfesorMateriaCurso:** id, profesor_id (FK→Persona), materia_id (FK→Materia), curso_id (FK→Curso), state. UniqueConstraint(profesor_id, materia_id, curso_id).
- **Evaluacion:** id, materia_id (FK), curso_id (FK), lapso_id (FK), nombre, porcentaje (0-100), fecha, descripcion, state.
- **NotaEvaluacion:** id, estudiante_id (FK→Persona), evaluacion_id (FK→Evaluacion), nota (1-20), registrado_por (FK→Persona), fecha_registro, observacion, state. UniqueConstraint(estudiante_id, evaluacion_id).
- **Permiso:** id, persona_id (FK→Persona, único), ver/registrar/editar/eliminar_notas, ver/registrar/editar/eliminar_estudiantes, ver/registrar/editar/eliminar_profesores, gestionar_materias, gestionar_curso, ver_auditoria, gestionar_permisos, generar_reportes, ultima_modificacion, state.
- **Auditoria:** id, persona_id (FK→Persona), accion, tabla_afectada, valor_anterior (JSONB), valor_nuevo (JSONB), ip_address, fecha_hora.
- **PasswordHistorial:** id, persona_id (FK→Persona), password_hash, fecha_cambio, state.
- **NotaFinal:** id, estudiante_id (FK→Persona), materia_id (FK→Materia), curso_id (FK→Curso), nota_final (Numeric 4,2), state. UniqueConstraint(estudiante_id, materia_id, curso_id). Se calcula como promedio ponderado de las evaluaciones.

## 8. Variables de Entorno
| Variable | Descripción | Dónde se usa |
|---|---|---|
| SECRET_KEY | Clave secreta para firmar tokens JWT | `backend/utils/auth.py`, `backend/controllers/persona.py` |
| DATABASE_URL | URL de conexión a PostgreSQL | `docker-compose.yml` (contenedor backend) |

> `backend/config/db.py` lee `DATABASE_URL` del entorno y, si no existe, usa una URL local de desarrollo como fallback.

## 9. Autenticación y Seguridad
- Método de auth: JWT (HS256) almacenado en cookie httpOnly `access_token` (30 min de expiración)
- Roles existentes: `estudiante`, `profesor`, `control_estudio`, `direccion` (definidos en `utils/types.py` como `RolUsuario`)
- Permisos granulares por rol en tabla `Permiso` (ver/registrar/editar/eliminar por módulo)
- Cosas sensibles que el modelo **nunca** debe tocar, exponer o commitear:
  - `backend/.env` (contiene SECRET_KEY)
  - `password_hash` en cualquier respuesta de API
  - Credenciales de base de datos
  - El valor de `SECRET_KEY` del docker-compose (`tu_clave_secreta_jwt`)

## 10. Convenciones de Código
- Estilo de nombres / lenguaje: Python (snake_case) backend, TypeScript (camelCase/PascalCase) frontend. Comentarios y mensajes en español.
- Linter / formatter usado: No configurado (no se encontró ruff/black/eslint/prettier)
- Patrón de commits: No definido formalmente
- Dónde va cada tipo de archivo nuevo:
  - Nueva entidad: modelo en `models.py`, router en `controllers/nueva_entidad.py`, registrar en `main.py`
  - Nueva ruta frontend: en `app/routes/`, registrar en `app/routes.ts`
  - Nuevo servicio API: en `src/services/`

## 11. Comandos Útiles
```bash
# Levantar todo con Docker
docker-compose up --build

# Backend (desarrollo local)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (desarrollo local)
cd flonten_clablon_biacho
npm install
npm run dev

# Tests
# No hay tests configurados

# Build
cd flonten_clablon_biacho && npm run build
```

## 12. Integraciones Externas
- No hay integraciones externas configuradas (sin APIs de terceros, pagos, email, webhooks).

## 13. Reglas para Trabajar en Este Proyecto (para el modelo/agente)
- Qué puede modificar libremente:
  - Componentes y rutas del frontend
  - Controladores y rutas del backend
  - Modelos de datos (agregar campos/tablas)
  - Estilos y UI
- Qué **nunca** debe tocar sin confirmación explícita:
  - `docker-compose.yml` (configuración de infraestructura)
  - `backend/.env` (secretos)
  - Migraciones de base de datos
  - Lógica de autenticación (`utils/auth.py`)
  - El archivo `config/db.py` (URL de conexión)
- Dónde agregar nuevas rutas o features:
  - Backend: crear archivo en `controllers/`, registrar en `main.py`
  - Frontend: crear archivo en `app/routes/`, registrar en `app/routes.ts`
- Qué validar/testear antes de dar algo por terminado:
  - Que el endpoint responda correctamente (probar con curl o Swagger en /docs)
  - Que la auditoría se registre en la tabla `auditoria`
  - Que el borrado lógico funcione (state=False, no DELETE físico)
  - Que el frontend compile sin errores (`npm run build`)

## 14. Problemas Conocidos / Deuda Técnica
- `utils/auth.py` tiene un fallback que retorna `usuario_id=0` si no hay cookie (modo desarrollo inseguro). La auditoría omite el registro cuando `persona_id` es 0 para no violar la FK.
- `controllers/permiso.py` está incompleto (solo tiene la definición del router)
- `controllers/password_historial.py` no usa auditoría ni auth
- No hay tests automatizados
- No hay migraciones (Alembic) — las tablas se crean con `create_all()` (incluyendo la nueva tabla `nota_final`)
- El frontend es solo el template inicial de React Router (sin funcionalidad real)
- CORS está configurado solo para `localhost:5173` (desarrollo con Vite)

## 15. Roadmap / Próximos Pasos
- Completar el módulo de permisos (`controllers/permiso.py`)
- Implementar el fallback de auth real (rechazar requests sin token)
- Conectar el frontend con la API (login, dashboard, CRUDs)
- Agregar tests (pytest para backend, vitest para frontend)
- Configurar Alembic para migraciones
- Implementar recuperación de contraseña con preguntas de seguridad
- Agregar paginación y filtros en los endpoints de listado
- Implementar reportes (boletas de calificaciones)
