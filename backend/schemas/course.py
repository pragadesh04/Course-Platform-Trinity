from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class CoursePrices(BaseModel):
    m3: float = 0
    m6: float = 0
    lifetime: float = 0


class SessionInfo(BaseModel):
    title: str
    description: str
    video_url: str = ""


class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail_url: str = ""
    prices: CoursePrices = Field(default_factory=CoursePrices)
    video_links: List[str] = []
    category_id: Optional[str] = None
    featured: bool = False


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    prices: Optional[CoursePrices] = None
    video_links: Optional[List[str]] = None
    category_id: Optional[str] = None
    featured: Optional[bool] = None


class CourseResponse(CourseBase):
    id: str
    sessions: int = 0
    duration: int = 0
    created_at: datetime
    category_name: str = ""
    sessions_list: List[SessionInfo] = []

    class Config:
        from_attributes = True
