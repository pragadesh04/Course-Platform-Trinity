from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class UserBase(BaseModel):
    name: str
    mobile_number: str = Field(..., unique=True)


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    mobile_number: str
    password: str


class UserResponse(UserBase):
    id: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
