from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class PaymentMethod(str, Enum):
    GPAY = "gpay"
    PHONEPE = "phonepe"
    CARD = "card"


class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class OrderItem(BaseModel):
    item_id: str
    item_type: str  # "course" or "product"
    title: str
    price: float
    plan: Optional[str] = None  # "3m", "6m", "lifetime" for courses


class OrderCreate(BaseModel):
    items: List[OrderItem]
    payment_method: PaymentMethod


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    payment_method: PaymentMethod
    status: OrderStatus
    created_at: datetime

    class Config:
        from_attributes = True
