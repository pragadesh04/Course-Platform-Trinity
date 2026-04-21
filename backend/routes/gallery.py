from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import gallery_collection
from schemas import GalleryImageCreate, GalleryImageResponse, UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/gallery", tags=["Gallery"])


def gallery_helper(image) -> GalleryImageResponse:
    return GalleryImageResponse(
        id=str(image["_id"]),
        image_url=image["image_url"],
        title=image.get("title", ""),
        span=image.get("span", 1),
        type=image.get("type", "gallery"),
        created_at=image["created_at"],
    )


@router.get("", response_model=List[GalleryImageResponse])
async def get_gallery():
    images = []
    async for image in gallery_collection.find().sort("created_at", -1):
        images.append(gallery_helper(image))
    return images


@router.post("", response_model=GalleryImageResponse)
async def create_gallery_image(
    image_data: GalleryImageCreate, admin: UserResponse = Depends(get_admin_user)
):
    image_doc = {**image_data.model_dump(), "created_at": datetime.utcnow()}

    result = await gallery_collection.insert_one(image_doc)
    image_doc["_id"] = result.inserted_id

    return gallery_helper(image_doc)


@router.delete("/{image_id}")
async def delete_gallery_image(
    image_id: str, admin: UserResponse = Depends(get_admin_user)
):
    result = await gallery_collection.delete_one({"_id": ObjectId(image_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}
