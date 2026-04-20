from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import courses_collection, categories_collection
from schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    UserResponse,
    CoursePrices,
)
from auth import get_admin_user, get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])


def course_helper(course, include_sessions: bool = False) -> dict:
    video_links = course.get("video_links", [])
    sessions_list = []

    if include_sessions:
        sessions_list = [
            {
                "title": f"Session {i + 1}",
                "description": f"Learn session {i + 1} content",
                "video_url": link if link.startswith("http") else "",
            }
            for i, link in enumerate(video_links)
        ]

    response_data = {
        "id": str(course["_id"]),
        "title": course["title"],
        "description": course["description"],
        "thumbnail_url": course.get("thumbnail_url", ""),
        "prices": course.get("prices", {}),
        "video_links": video_links,
        "sessions": len(video_links),
        "duration": course.get("duration", 0),
        "category_id": course.get("category_id"),
        "featured": course.get("featured", False),
        "created_at": course["created_at"],
        "category_name": "",
        "sessions_list": sessions_list,
    }

    return response_data


async def get_category_name(category_id: str) -> str:
    if not category_id:
        return ""
    try:
        category = await categories_collection.find_one({"_id": ObjectId(category_id)})
        return category.get("name", "") if category else ""
    except:
        return ""


@router.get("", response_model=List[CourseResponse])
async def get_courses(
    category_id: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    courses = []
    async for course in courses_collection.find(query).sort("created_at", -1):
        course_data = course_helper(course)
        course_data["category_name"] = await get_category_name(
            course.get("category_id")
        )
        courses.append(course_data)
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    course = await courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course_data = course_helper(course, include_sessions=True)
    course_data["category_name"] = await get_category_name(course.get("category_id"))
    return course_data


@router.post("", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate, admin: UserResponse = Depends(get_admin_user)
):
    prices_dict = course_data.prices.model_dump() if course_data.prices else {}

    course_doc = {
        "title": course_data.title,
        "description": course_data.description,
        "thumbnail_url": course_data.thumbnail_url,
        "prices": prices_dict,
        "video_links": course_data.video_links,
        "sessions": len(course_data.video_links),
        "duration": 0,
        "category_id": course_data.category_id,
        "featured": course_data.featured,
        "created_at": datetime.utcnow(),
    }

    result = await courses_collection.insert_one(course_doc)
    course_doc["_id"] = result.inserted_id

    response = course_helper(course_doc)
    response["category_name"] = await get_category_name(course_data.category_id)
    return response


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    admin: UserResponse = Depends(get_admin_user),
):
    existing = await courses_collection.find_one({"_id": ObjectId(course_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_data.model_dump(exclude_unset=True)

    if "prices" in update_data and update_data["prices"]:

        update_data["prices"] = update_data["prices"]

    if "video_links" in update_data:
        update_data["sessions"] = len(update_data["video_links"])

    await courses_collection.update_one(
        {"_id": ObjectId(course_id)}, {"$set": update_data}
    )

    updated = await courses_collection.find_one({"_id": ObjectId(course_id)})
    response = course_helper(updated)
    response["category_name"] = await get_category_name(updated.get("category_id"))
    return response


@router.delete("/{course_id}")
async def delete_course(course_id: str, admin: UserResponse = Depends(get_admin_user)):
    result = await courses_collection.delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}
