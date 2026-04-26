from pydantic import BaseModel, Field
from typing import Optional, List
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


class InstructorInfo(BaseModel):
    name: str = ""
    bio: str = ""
    photo_url: str = ""
    social_links: dict = {}


class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail_url: str = ""
    prices: CoursePrices = Field(default_factory=CoursePrices)
    video_links: list = []
    session_durations: list = []
    session_titles: list = []
    category_ids: List[str] = []
    featured: bool = False
    is_first_session_free: bool = False
    is_free: bool = False
    what_you_will_learn: list = []
    prerequisites: list = []
    instructor_info: InstructorInfo = Field(default_factory=InstructorInfo)


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    prices: Optional[CoursePrices] = None
    video_links: Optional[list] = None
    session_durations: Optional[list] = None
    session_titles: Optional[list] = None
    category_ids: Optional[List[str]] = None
    featured: Optional[bool] = None
    is_first_session_free: Optional[bool] = None
    is_free: bool = False
    what_you_will_learn: Optional[list] = None
    prerequisites: Optional[list] = None
    instructor_info: Optional[InstructorInfo] = None


class CourseResponse(CourseBase):
    id: str
    sessions: int = 0
    duration: float = 0
    created_at: datetime
    category_names: List[str] = []
    sessions_list: list = []

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