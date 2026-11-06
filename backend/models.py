from config.db import Base
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date, DateTime, 
    Numeric, ForeignKey, UniqueConstraint, CheckConstraint
)
from sqlalchemy.sql import func
import enum 
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLEnum
from utils.types import RolUsuario

class Curso(Base):
    __tablename__ = "curso"

    id = Column(Integer, primary_key=True, index=True)
    año= Column(Integer, index=True)
    seccion = Column(String, index=True)
    turno = Column(String, index=True)
    año_escolar = Column(String, index=True)
    state = Column(Boolean, default=True, index=True)
    
    # Relaciones 
    estudiantes_inscritos = relationship("EstudianteCurso", back_populates="curso")
    asignaciones_profesores = relationship("ProfesorMateriaCurso", back_populates="curso")
    evaluaciones = relationship("Evaluacion", back_populates="curso")
    

# ==========================================
# 2. TABLAS PRINCIPALES (Entidades base)
# ==========================================

class Persona(Base):
    """Tabla 'personas': Almacena todos los usuarios del sistema sin importar su rol."""
    __tablename__ = "personas"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String(15), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), unique=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(SQLEnum(RolUsuario), nullable=False)
    activo = Column(Boolean, server_default='true')
    fecha_registro = Column(DateTime, server_default=func.now())
    state = Column(Boolean, default=True, index=True)

    pregunta_seguridad_1 = Column(String(255))
    respuesta_seguridad_1 = Column(String(255))
    pregunta_seguridad_2 = Column(String(255))
    respuesta_seguridad_2 = Column(String(255))

    fecha_ultimo_password = Column(DateTime, server_default=func.now())
    debe_cambiar_password = Column(Boolean, server_default='false')
    
    # Relaciones 
    permiso = relationship("Permiso", back_populates="persona", uselist=False) 
    historial_passwords = relationship("PasswordHistorial", back_populates="persona")
    auditorias = relationship("Auditoria", back_populates="persona")
    
    # Relaciones N:M a través de las tablas intermedias
    curso_inscritos = relationship("EstudianteCurso", back_populates="estudiante")
    asignaciones_materias = relationship("ProfesorMateriaCurso", back_populates="profesor")
    
    notas_recibidas = relationship("NotaEvaluacion", foreign_keys="[NotaEvaluacion.estudiante_id]", back_populates="estudiante")
    notas_registradas = relationship("NotaEvaluacion", foreign_keys="[NotaEvaluacion.registrado_por]", back_populates="registrador")

    
class Materia(Base):
    """Tabla 'materias': Catálogo de asignaturas dictadas en la institución."""
    __tablename__ = "materias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    codigo = Column(String(20), unique=True)
    descripcion = Column(Text)
    state = Column(Boolean, default=True, index=True)

    # Relaciones
    asignaciones = relationship("ProfesorMateriaCurso", back_populates="materia")
    evaluaciones = relationship("Evaluacion", back_populates="materia")

class Lapso(Base):
    """Tabla 'lapsos': Define los periodos de evaluación (1er, 2do y 3er lapso)."""
    __tablename__ = "lapsos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False)
    año_escolar = Column(String(10), nullable=False)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        CheckConstraint('numero BETWEEN 1 AND 3', name='check_numero_lapso'),
        UniqueConstraint('numero', 'año_escolar', name='uq_lapso_escolar')
    )    

    # Relaciones
    evaluaciones = relationship("Evaluacion", back_populates="lapso")

# ==========================================
# 3. TABLAS INTERMEDIAS (Relaciones N a M)
# ==========================================

class EstudianteCurso(Base):
    """Tabla 'estudiante_curso': Relaciona qué estudiantes están inscritos en qué curso."""
    __tablename__ = "estudiante_curso"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("curso.id"), nullable=False)
    fecha_inscripcion = Column(Date, server_default=func.current_date())
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        UniqueConstraint('estudiante_id', 'curso_id', name='uq_estudiante_curso'),
    )

    # Relaciones inversas hacia las entidades base
    estudiante = relationship("Persona", back_populates="curso_inscritos")
    curso = relationship("Curso", back_populates="estudiantes_inscritos")

class ProfesorMateriaCurso(Base):
    """Tabla 'profesor_materia_curso': Asigna qué profesor da qué materia en qué curso."""
    __tablename__ = "profesor_materia_curso"

    id = Column(Integer, primary_key=True, index=True)
    profesor_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("curso.id"), nullable=False)
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        UniqueConstraint('profesor_id', 'materia_id', 'curso_id', name='uq_profesor_asignacion'),
    )

    # Relaciones inversas hacia las entidades base
    profesor = relationship("Persona", back_populates="asignaciones_materias")
    materia = relationship("Materia", back_populates="asignaciones")
    curso = relationship("Curso", back_populates="asignaciones_profesores")

# ==========================================
# 4. TABLAS DE EVALUACIÓN Y NOTAS
# ==========================================

class Evaluacion(Base):
    """Tabla 'evaluaciones': Define los exámenes o tareas planificadas."""
    __tablename__ = "evaluaciones"

    id = Column(Integer, primary_key=True, index=True)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("curso.id"), nullable=False)
    lapso_id = Column(Integer, ForeignKey("lapsos.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    porcentaje = Column(Numeric(5, 2), nullable=False)
    fecha = Column(Date)
    descripcion = Column(Text)
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        CheckConstraint('porcentaje > 0 AND porcentaje <= 100', name='check_porcentaje_valido'),
    )

    # Relaciones inversas y hacia notas
    materia = relationship("Materia", back_populates="evaluaciones")
    curso = relationship("Curso", back_populates="evaluaciones")
    lapso = relationship("Lapso", back_populates="evaluaciones")
    notas = relationship("NotaEvaluacion", back_populates="evaluacion")

class NotaEvaluacion(Base):
    """Tabla 'notas_evaluacion': Almacena la calificación obtenida por un estudiante."""
    __tablename__ = "notas_evaluacion"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    evaluacion_id = Column(Integer, ForeignKey("evaluaciones.id"), nullable=False)
    nota = Column(Numeric(4, 2), nullable=False)
    registrado_por = Column(Integer, ForeignKey("personas.id"), nullable=False)
    fecha_registro = Column(DateTime, server_default=func.now())
    observacion = Column(Text)
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        CheckConstraint('nota >= 1 AND nota <= 20', name='check_nota_valida'),
        UniqueConstraint('estudiante_id', 'evaluacion_id', name='uq_estudiante_evaluacion')
    )                

    # Aquí mapeamos especificando las listas de objetos columna para resolver la ambigüedad
    estudiante = relationship("Persona", foreign_keys=[estudiante_id], back_populates="notas_recibidas")
    evaluacion = relationship("Evaluacion", back_populates="notas")
    registrador = relationship("Persona", foreign_keys=[registrado_por], back_populates="notas_registradas")

# ==========================================
# 5. TABLAS DE SEGURIDAD Y AUDITORÍA
# ==========================================

class Permiso(Base):
    """Tabla 'permisos': Control de acceso granular a los módulos del sistema."""
    __tablename__ = "permisos"

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("personas.id"), unique=True, nullable=False)
    state = Column(Boolean, default=True, index=True)

    ver_notas = Column(Boolean, server_default='false')
    registrar_notas = Column(Boolean, server_default='false')
    editar_notas = Column(Boolean, server_default='false')
    eliminar_notas = Column(Boolean, server_default='false')

    ver_estudiantes = Column(Boolean, server_default='false')
    registrar_estudiantes = Column(Boolean, server_default='false')
    editar_estudiantes = Column(Boolean, server_default='false')
    eliminar_estudiantes = Column(Boolean, server_default='false')

    ver_profesores = Column(Boolean, server_default='false')
    registrar_profesores = Column(Boolean, server_default='false')
    editar_profesores = Column(Boolean, server_default='false')
    eliminar_profesores = Column(Boolean, server_default='false')

    gestionar_materias = Column(Boolean, server_default='false')
    gestionar_curso = Column(Boolean, server_default='false')

    ver_auditoria = Column(Boolean, server_default='false')
    gestionar_permisos = Column(Boolean, server_default='false')
    generar_reportes = Column(Boolean, server_default='false')

    ultima_modificacion = Column(DateTime, server_default=func.now(), onupdate=func.now())

    persona = relationship("Persona", back_populates="permiso")

class Auditoria(Base):
    """Tabla 'auditoria': Registro de todas las acciones importantes (Logs)."""
    __tablename__ = "auditoria"

    # ... (El resto del archivo queda igual)
    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    accion = Column(String(50), nullable=False)
    tabla_afectada = Column(String(50), nullable=False)
    valor_anterior = Column(JSONB)
    valor_nuevo = Column(JSONB)
    ip_address = Column(String(45))
    fecha_hora = Column(DateTime, server_default=func.now())

    persona = relationship("Persona", back_populates="auditorias")

class PasswordHistorial(Base):
    """Tabla 'password_historial': Evita que el usuario repita contraseñas recientes."""
    __tablename__ = "password_historial"

    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    password_hash = Column(String(255), nullable=False)
    fecha_cambio = Column(DateTime, server_default=func.now())
    state = Column(Boolean, default=True, index=True)

    persona = relationship("Persona", back_populates="historial_passwords")


# ==========================================
# 6. TABLA DE NOTA FINAL POR MATERIA
# ==========================================

class NotaFinal(Base):
    """Tabla 'nota_final': Almacena la nota final de un estudiante en una materia."""
    __tablename__ = "nota_final"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("curso.id"), nullable=False)
    nota_final = Column(Numeric(4, 2), nullable=False)
    state = Column(Boolean, default=True, index=True)

    __table_args__ = (
        UniqueConstraint('estudiante_id', 'materia_id', 'curso_id', name='uq_nota_final_estudiante_materia_curso'),
    )

    estudiante = relationship("Persona", foreign_keys=[estudiante_id])
    materia = relationship("Materia")
    curso = relationship("Curso")