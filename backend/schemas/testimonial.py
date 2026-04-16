from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TestimonialBase(BaseModel):
    name: str
    role: str
    text: str
    avatar_url: str = ""
    rating: Optional[int] = None
    source: str = "manual"
    approved: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialResponse(TestimonialBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
