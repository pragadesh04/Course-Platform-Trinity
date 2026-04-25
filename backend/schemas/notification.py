from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    user_id: str
    course_id: str
    session_title: str
    message: str
    type: str = "course_update"
    is_read: bool = False


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    session_title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True