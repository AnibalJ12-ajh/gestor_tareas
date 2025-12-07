from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class TaskStatus(str, enum.Enum):
    PENDIENTE = "Pendiente"
    EN_PROGRESO = "En Progreso"
    COMPLETADA = "Completada"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(Date, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDIENTE)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")