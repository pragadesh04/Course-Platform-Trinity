from pydantic import BaseModel
from datetime import datetime


class GalleryImageBase(BaseModel):
    image_url: str
    title: str = ""
    span: int = 1


class GalleryImageCreate(GalleryImageBase):
    pass


class GalleryImageResponse(GalleryImageBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
