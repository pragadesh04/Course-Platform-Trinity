from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class CategoryType(str, Enum):
    COURSE = "course"
    PRODUCT = "product"


class CategoryBase(BaseModel):
    name: str
    slug: str
    type: CategoryType


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
