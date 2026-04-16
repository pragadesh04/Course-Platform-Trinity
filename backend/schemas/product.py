from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    thumbnail_url: str = ""
    key_features: List[str] = []
    tags: List[str] = []
    category_id: Optional[str] = None
    featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    thumbnail_url: Optional[str] = None
    key_features: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    category_id: Optional[str] = None
    featured: Optional[bool] = None


class ProductResponse(ProductBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
