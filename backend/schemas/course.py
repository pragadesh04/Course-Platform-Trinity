from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CoursePrices(BaseModel):
    m3: float = 0
    m6: float = 0
    lifetime: float = 0


class SessionInfo(BaseModel):
    title: str
    description: str
    video_url: str = ""
    duration: float = 0
    is_free: bool = False


class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail_url: str = ""
    prices: CoursePrices = Field(default_factory=CoursePrices)
    video_links: List[str] = []
    session_durations: List[float] = []
    session_titles: List[str] = []
    category_id: Optional[str] = None
    featured: bool = False
    is_first_session_free: bool = False


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    prices: Optional[CoursePrices] = None
    video_links: Optional[List[str]] = None
    session_durations: Optional[List[float]] = None
    session_titles: Optional[List[str]] = None
    category_id: Optional[str] = None
    featured: Optional[bool] = None
    is_first_session_free: bool = False


class CourseResponse(CourseBase):
    id: str
    sessions: int = 0
    duration: float = 0
    created_at: datetime
    category_name: str = ""
    sessions_list: List[SessionInfo] = []

    class Config:
        from_attributes = True


class UserProgressBase(BaseModel):
    course_id: str
    session_idx: int
    timestamp: float = 0
    completed: bool = False


class UserProgressCreate(UserProgressBase):
    pass


class UserProgressUpdate(BaseModel):
    timestamp: Optional[float] = None


class UserProgressResponse(UserProgressBase):
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True
