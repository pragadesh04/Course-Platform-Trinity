from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import testimonials_collection
from schemas import TestimonialCreate, TestimonialResponse, UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


def testimonial_helper(testimonial) -> TestimonialResponse:
    return TestimonialResponse(
        id=str(testimonial["_id"]),
        name=testimonial["name"],
        role=testimonial["role"],
        text=testimonial["text"],
        avatar_url=testimonial.get("avatar_url", ""),
        created_at=testimonial["created_at"],
    )


@router.get("", response_model=List[TestimonialResponse])
async def get_testimonials():
    testimonials = []
    async for testimonial in testimonials_collection.find().sort("created_at", -1):
        testimonials.append(testimonial_helper(testimonial))
    return testimonials


@router.post("", response_model=TestimonialResponse)
async def create_testimonial(
    testimonial_data: TestimonialCreate, admin: UserResponse = Depends(get_admin_user)
):
    testimonial_doc = {**testimonial_data.model_dump(), "created_at": datetime.utcnow()}

    result = await testimonials_collection.insert_one(testimonial_doc)
    testimonial_doc["_id"] = result.inserted_id

    return testimonial_helper(testimonial_doc)


@router.delete("/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: str, admin: UserResponse = Depends(get_admin_user)
):
    result = await testimonials_collection.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}
