from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
import pymysql # <--- Importamos la nueva librería

# --- EL TRUCO MÁGICO ---
# Esto hace que PyMySQL se haga pasar por el driver que Railway está buscando
pymysql.install_as_MySQLdb() 

DATABASE_URL = os.getenv("DATABASE_URL")

# Corrección de seguridad: Si la URL viene sin driver, forzamos mysql+pymysql
# (Aunque con el truco de arriba, esto es un respaldo extra)
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()