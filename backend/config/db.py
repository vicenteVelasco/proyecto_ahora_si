import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# En Docker se usa la variable DATABASE_URL (apunta al servicio "db").
# En local, si no existe, se usa la URL de desarrollo por defecto.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:vavn1234@localhost:5432/sususupersi"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
        print({"message": "Database connection successful"})
    finally:
        db.close()
        print({"message": "Database connection closed"})

def create_tables():
     Base.metadata.create_all(bind=engine)
