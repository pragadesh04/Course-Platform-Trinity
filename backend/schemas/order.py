from pydantic import BaseModel
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
    coupon_code: Optional[str] = None
    coupon_discount: Optional[float] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    coupon_code: Optional[str] = None
    coupon_discount: Optional[float] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: OrderStatus
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentCreateRequest(BaseModel):
    items: List[OrderItem]
    coupon_code: Optional[str] = None
    coupon_discount: Optional[float] = None


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: Optional[str] = None
