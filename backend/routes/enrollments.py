from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import enrollments_collection, users_collection, courses_collection
from schemas import (
    EnrollmentCreate,
    EnrollmentUpdate,
    EnrollmentResponse,
    EnrollmentWithUser,
    UserResponse,
)
from services.enrollment import calculate_expiry
from auth import get_admin_user

router = APIRouter(prefix="/admin/enrollments", tags=["Admin Enrollments"])


async def get_course_title(course_id: str) -> str:
    try:
        course = await courses_collection.find_one({"_id": ObjectId(course_id)})
        return course.get("title", "") if course else ""
    except:
        return ""


async def enrollment_helper(enrollment: dict) -> dict:
    course_title = await get_course_title(enrollment.get("course_id"))
    user_name = None
    if enrollment.get("user_id"):
        user = await users_collection.find_one({"_id": ObjectId(enrollment["user_id"])})
        user_name = user.get("name") if user else None

    return {
        "id": str(enrollment["_id"]),
        "mobile_number": enrollment["mobile_number"],
        "user_name": user_name,
        "course_id": enrollment["course_id"],
        "course_title": course_title,
        "duration": enrollment["duration"],
        "status": enrollment["status"],
        "expires_at": enrollment.get("expires_at"),
        "created_at": enrollment["created_at"],
    }


@router.post("", response_model=EnrollmentResponse)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    admin: UserResponse = Depends(get_admin_user),
):
    user = await users_collection.find_one(
        {"mobile_number": enrollment_data.mobile_number}
    )

    user_id = str(user["_id"]) if user else None

    expires_at = calculate_expiry(enrollment_data.duration)

    status_value = "active" if user_id else "pending"

    enrollment_doc = {
        "mobile_number": enrollment_data.mobile_number,
        "user_id": user_id,
        "course_id": enrollment_data.course_id,
        "duration": enrollment_data.duration.value,
        "status": status_value,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
    }

    result = await enrollments_collection.insert_one(enrollment_doc)
    enrollment_doc["_id"] = result.inserted_id

    return EnrollmentResponse(
        id=str(result.inserted_id),
        mobile_number=enrollment_doc["mobile_number"],
        course_id=enrollment_doc["course_id"],
        duration=enrollment_data.duration,
        user_id=user_id,
        status=enrollment_doc["status"],
        expires_at=enrollment_doc["expires_at"],
        created_at=enrollment_doc["created_at"],
    )


@router.get("", response_model=List[EnrollmentWithUser])
async def get_enrollments(
    status_filter: Optional[str] = None,
    course_id: Optional[str] = None,
):
    query = {}
    if status_filter:
        query["status"] = status_filter
    if course_id:
        query["course_id"] = course_id

    enrollments = []
    async for enrollment in enrollments_collection.find(query).sort("created_at", -1):
        enrollment_data = await enrollment_helper(enrollment)
        enrollments.append(enrollment_data)

    return enrollments


@router.get("/{enrollment_id}", response_model=EnrollmentWithUser)
async def get_enrollment(
    enrollment_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    try:
        enrollment = await enrollments_collection.find_one(
            {"_id": ObjectId(enrollment_id)}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid enrollment ID")

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    return await enrollment_helper(enrollment)


@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(
    enrollment_id: str,
    enrollment_data: EnrollmentUpdate,
    admin: UserResponse = Depends(get_admin_user),
):
    try:
        existing = await enrollments_collection.find_one(
            {"_id": ObjectId(enrollment_id)}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid enrollment ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    update_dict = {}

    if enrollment_data.duration is not None:
        update_dict["duration"] = enrollment_data.duration.value
        update_dict["expires_at"] = calculate_expiry(enrollment_data.duration)

    if enrollment_data.status is not None:
        update_dict["status"] = enrollment_data.status.value

    if enrollment_data.expires_at is not None:
        update_dict["expires_at"] = enrollment_data.expires_at

    if update_dict:
        await enrollments_collection.update_one(
            {"_id": ObjectId(enrollment_id)}, {"$set": update_dict}
        )

    updated = await enrollments_collection.find_one({"_id": ObjectId(enrollment_id)})

    return EnrollmentResponse(
        id=str(updated["_id"]),
        mobile_number=updated["mobile_number"],
        course_id=updated["course_id"],
        duration=enrollment_data.duration or updated["duration"],
        user_id=updated.get("user_id"),
        status=updated["status"],
        expires_at=updated.get("expires_at"),
        created_at=updated["created_at"],
    )


@router.delete("/{enrollment_id}")
async def delete_enrollment(
    enrollment_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    try:
        result = await enrollments_collection.delete_one(
            {"_id": ObjectId(enrollment_id)}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid enrollment ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    return {"message": "Enrollment deleted successfully"}


async def claim_enrollments_for_user(user_id: str, mobile_number: str) -> List[dict]:
    claimed = []

    async for enrollment in enrollments_collection.find(
        {
            "mobile_number": mobile_number,
            "status": "pending",
        }
    ):
        expires_at = calculate_expiry(enrollment["duration"])

        await enrollments_collection.update_one(
            {"_id": enrollment["_id"]},
            {
                "$set": {
                    "user_id": user_id,
                    "status": "active",
                    "expires_at": expires_at,
                }
            },
        )

        claimed.append(
            {
                "course_id": enrollment["course_id"],
                "duration": enrollment["duration"],
                "expires_at": expires_at,
            }
        )

    return claimed
