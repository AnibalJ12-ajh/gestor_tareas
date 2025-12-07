from pydantic import BaseModel
from typing import Optional
from datetime import date
from .models import TaskStatus

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: date
    status: TaskStatus = TaskStatus.PENDIENTE

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    class Config:
        orm_mode = True