from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class EnrollmentDuration(str, Enum):
    M3 = "3m"
    M6 = "6m"
    LIFETIME = "lifetime"


class EnrollmentStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"


class EnrollmentBase(BaseModel):
    mobile_number: str
    course_id: str
    duration: EnrollmentDuration = EnrollmentDuration.M3


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    duration: Optional[EnrollmentDuration] = None
    status: Optional[EnrollmentStatus] = None
    expires_at: Optional[datetime] = None


class EnrollmentResponse(EnrollmentBase):
    id: str
    user_id: Optional[str] = None
    status: EnrollmentStatus
    expires_at: Optional[datetime] = None
    created_at: datetime
    course_title: Optional[str] = None

    class Config:
        from_attributes = True


class EnrollmentWithUser(BaseModel):
    id: str
    mobile_number: str
    user_name: Optional[str] = None
    course_id: str
    course_title: str
    duration: EnrollmentDuration
    status: EnrollmentStatus
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
