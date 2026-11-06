from sqlalchemy.orm import Session
from models import Auditoria
from fastapi.encoders import jsonable_encoder

def preparar_datos_auditoria(objeto_o_dict):
    """Convierte objetos de SQLAlchemy, modelos Pydantic o diccionarios a JSON seguro, manejando fechas y tipos especiales."""
    if objeto_o_dict is None:
        return None
    
    # Si es un modelo de SQLAlchemy
    if hasattr(objeto_o_dict, "__table__"):
        datos = {c.name: getattr(objeto_o_dict, c.name) for c in objeto_o_dict.__table__.columns}
        return jsonable_encoder(datos)
    
    # Si es un diccionario o modelo Pydantic (aquí es donde se limpian las fechas)
    return jsonable_encoder(objeto_o_dict)

def registrar_auditoria(db: Session, persona_id: int, accion: str, tabla_afectada: str, valor_anterior: dict = None, valor_nuevo: dict = None, ip_address: str = None):
    # Sin usuario autenticado (modo desarrollo, persona_id=0) no se puede registrar:
    # la tabla auditoria tiene FK hacia personas y fallaría por integridad.
    if not persona_id:
        return

    nueva_auditoria = Auditoria(
        persona_id=persona_id,
        accion=accion,
        tabla_afectada=tabla_afectada,
        valor_anterior=valor_anterior,
        valor_nuevo=valor_nuevo,
        ip_address=ip_address
    )
    db.add(nueva_auditoria)
    db.commit()
    db.refresh(nueva_auditoria)