from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from database import (
    feedbacks_collection,
    testimonials_collection,
    courses_collection,
    orders_collection,
)
from schemas import UserResponse, UserRole
from auth import get_current_user, get_admin_user

router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str


class FeedbackResponse(BaseModel):
    id: str
    course_id: str
    course_title: str
    user_id: str
    user_name: str
    rating: int
    text: str
    approved: bool
    testimonial_id: Optional[str] = None
    created_at: datetime


def feedback_helper(feedback) -> FeedbackResponse:
    return FeedbackResponse(
        id=str(feedback["_id"]),
        course_id=feedback["course_id"],
        course_title=feedback.get("course_title", ""),
        user_id=feedback["user_id"],
        user_name=feedback["user_name"],
        rating=feedback["rating"],
        text=feedback["text"],
        approved=feedback.get("approved", True),
        testimonial_id=feedback.get("testimonial_id"),
        created_at=feedback["created_at"],
    )


async def check_enrollment(user_id: str, course_id: str) -> bool:
    order = await orders_collection.find_one(
        {
            "user_id": user_id,
            "items": {
                "$elemMatch": {
                    "item_type": "course",
                    "item_id": course_id,
                }
            },
            "status": "completed",
        }
    )
    return order is not None


@router.post("/{course_id}")
async def create_feedback(
    course_id: str,
    data: FeedbackCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    is_enrolled = await check_enrollment(current_user.id, course_id)
    if not is_enrolled:
        raise HTTPException(
            status_code=403, detail="You must be enrolled to submit feedback"
        )

    course = await courses_collection.find_one({"_id": ObjectId(course_id)})
    course_title = course.get("title", "") if course else ""

    testimonial_id = None
    auto_added = False

    if data.rating >= 4:
        testimonial_doc = {
            "name": current_user.name,
            "role": f"Student · {course_title}",
            "text": data.text,
            "avatar_url": "",
            "rating": data.rating,
            "source": "auto",
            "created_at": datetime.utcnow(),
        }
        result = await testimonials_collection.insert_one(testimonial_doc)
        testimonial_id = str(result.inserted_id)
        auto_added = True

    feedback_doc = {
        "course_id": course_id,
        "course_title": course_title,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "rating": data.rating,
        "text": data.text,
        "approved": data.rating >= 4,
        "testimonial_id": testimonial_id,
        "created_at": datetime.utcnow(),
    }

    result = await feedbacks_collection.insert_one(feedback_doc)
    feedback_doc["_id"] = result.inserted_id

    return {
        "success": True,
        "feedback": feedback_helper(feedback_doc),
        "auto_added_to_testimonials": auto_added,
    }


@router.get("/{course_id}", response_model=List[FeedbackResponse])
async def get_course_feedbacks(
    course_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    feedbacks = []
    async for fb in feedbacks_collection.find({"course_id": course_id}).sort(
        "created_at", -1
    ):
        feedbacks.append(feedback_helper(fb))
    return feedbacks


@router.get("/all/all", response_model=List[FeedbackResponse])
async def get_all_feedbacks(admin: UserResponse = Depends(get_admin_user)):
    feedbacks = []
    async for fb in feedbacks_collection.find().sort("created_at", -1):
        feedbacks.append(feedback_helper(fb))
    return feedbacks


@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    feedback = await feedbacks_collection.find_one({"_id": ObjectId(feedback_id)})
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.get("testimonial_id"):
        await testimonials_collection.delete_one(
            {"_id": ObjectId(feedback["testimonial_id"])}
        )

    await feedbacks_collection.delete_one({"_id": ObjectId(feedback_id)})
    return {"message": "Feedback deleted"}


@router.patch("/{feedback_id}/testimonial")
async def toggle_testimonial_visibility(
    feedback_id: str,
    visible: bool,
    admin: UserResponse = Depends(get_admin_user),
):
    feedback = await feedbacks_collection.find_one({"_id": ObjectId(feedback_id)})
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.get("testimonial_id"):
        await testimonials_collection.update_one(
            {"_id": ObjectId(feedback["testimonial_id"])},
            {"$set": {"approved": visible}},
        )

    return {"success": True}
