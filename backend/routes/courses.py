from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import courses_collection, categories_collection, user_progress_collection
from schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    UserResponse,
    UserProgressCreate,
    UserProgressUpdate,
    UserProgressResponse,
)
from auth import get_admin_user, get_current_user
from utils.ai import course_ai

router = APIRouter(prefix="/courses", tags=["Courses"])


def course_helper(course, include_sessions: bool = False) -> dict:
    video_links = course.get("video_links", [])
    session_durations = course.get("session_durations", [])
    session_titles = course.get("session_titles", [])
    is_first_session_free = course.get("is_first_session_free", False)
    sessions_list = []

    if include_sessions:
        sessions_list = [
            {
                "title": session_titles[i]
                if i < len(session_titles)
                else f"Session {i + 1}",
                "description": f"Learn session {i + 1} content",
                "video_url": link if link.startswith("http") else "",
                "duration": session_durations[i] if i < len(session_durations) else 0,
                "is_free": is_first_session_free and i == 0,
            }
            for i, link in enumerate(video_links)
        ]

    total_duration = (
        sum(session_durations) if session_durations else course.get("duration", 0)
    )

    instructor_info = course.get("instructor_info", {})
    if isinstance(instructor_info, dict):
        instructor_data = {
            "name": instructor_info.get("name", ""),
            "bio": instructor_info.get("bio", ""),
            "photo_url": instructor_info.get("photo_url", ""),
            "social_links": instructor_info.get("social_links", {}),
        }
    else:
        instructor_data = {"name": "", "bio": "", "photo_url": "", "social_links": {}}

    what_you_will_learn = course.get("what_you_will_learn", [])
    prerequisites = course.get("prerequisites", [])
    is_free = course.get("is_free", False)

    response_data = {
        "id": str(course["_id"]),
        "title": course["title"],
        "description": course["description"],
        "thumbnail_url": course.get("thumbnail_url", ""),
        "prices": course.get("prices", {}),
        "video_links": video_links,
        "sessions": len(video_links),
        "duration": total_duration,
        "session_titles": session_titles,
        "category_ids": course.get("category_ids", []),
        "featured": course.get("featured", False),
        "created_at": course["created_at"],
        "category_names": [],
        "sessions_list": sessions_list,
        "is_first_session_free": is_first_session_free,
        "is_free": is_free,
        "what_you_will_learn": what_you_will_learn,
        "prerequisites": prerequisites,
        "instructor_info": instructor_data,
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


async def get_category_names(category_ids: List[str]) -> List[str]:
    names = []
    for cat_id in category_ids:
        name = await get_category_name(cat_id)
        if name:
            names.append(name)
    return names


@router.get("", response_model=List[CourseResponse])
async def get_courses(
    category_ids: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
):
    query = {}
    if category_ids:
        cat_ids = [c.strip() for c in category_ids.split(",") if c.strip()]
        if cat_ids:
            query["category_ids"] = {"$in": cat_ids}
    if featured is not None:
        query["featured"] = featured
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    courses = []
    async for course in courses_collection.find(query).sort("created_at", -1):
        course_data = course_helper(course)
        course_data["category_names"] = await get_category_names(
            course.get("category_ids", [])
        )
        courses.append(course_data)
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    course = await courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course_data = course_helper(course, include_sessions=True)
    course_data["category_names"] = await get_category_names(course.get("category_ids", []))
    return course_data


@router.post("", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate, admin: UserResponse = Depends(get_admin_user)
):
    prices_dict = course_data.prices.model_dump() if course_data.prices else {}
    session_durations = course_data.session_durations or []
    session_titles = course_data.session_titles or []
    total_duration = round(sum(session_durations), 2)

    instructor_info = course_data.instructor_info
    if instructor_info:
        instructor_dict = instructor_info.model_dump()
    else:
        instructor_dict = {"name": "", "bio": "", "photo_url": "", "social_links": {}}

    course_doc = {
        "title": course_data.title,
        "description": course_data.description,
        "thumbnail_url": course_data.thumbnail_url,
        "prices": prices_dict,
        "video_links": course_data.video_links,
        "sessions": len(course_data.video_links),
        "duration": total_duration,
        "session_durations": session_durations,
        "session_titles": session_titles,
        "category_ids": course_data.category_ids or [],
        "featured": course_data.featured,
        "is_first_session_free": course_data.is_first_session_free,
        "is_free": course_data.is_free,
        "what_you_will_learn": course_data.what_you_will_learn or [],
        "prerequisites": course_data.prerequisites or [],
        "instructor_info": instructor_dict,
        "created_at": datetime.utcnow(),
    }

    print(f"[DEBUG POST] is_first_session_free: {course_data.is_first_session_free}")
    print(f"[DEBUG POST] Full course_doc: {course_doc.get('is_first_session_free')}")

    result = await courses_collection.insert_one(course_doc)
    course_doc["_id"] = result.inserted_id

    response = course_helper(course_doc)
    response["category_names"] = await get_category_names(course_data.category_ids or [])
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

    try:
        update_data = course_data.model_dump(exclude_unset=True, exclude_none=True)
    except Exception as e:
        print(f"[DEBUG] model_dump error: {e}")
        update_data = {}

    if "prices" in update_data and update_data["prices"]:
        update_data["prices"] = update_data["prices"]

    old_video_links = existing.get("video_links", [])
    new_video_links = update_data.get("video_links", old_video_links)
    
    if "video_links" in update_data:
        update_data["sessions"] = len(update_data["video_links"])

    if "session_durations" in update_data and update_data["session_durations"]:
        update_data["duration"] = round(sum(update_data["session_durations"]), 2)

    if "instructor_info" in update_data and update_data["instructor_info"]:
        try:
            if isinstance(update_data["instructor_info"], dict):
                pass
            elif hasattr(update_data["instructor_info"], "model_dump"):
                update_data["instructor_info"] = update_data["instructor_info"].model_dump()
            else:
                update_data["instructor_info"] = dict(update_data["instructor_info"])
        except Exception as e:
            print(f"[DEBUG] instructor_info conversion error: {e}")
            if "instructor_info" in update_data:
                del update_data["instructor_info"]

    update_data["is_first_session_free"] = course_data.is_first_session_free
    update_data["is_free"] = course_data.is_free

    await courses_collection.update_one(
        {"_id": ObjectId(course_id)}, {"$set": update_data}
    )

    updated = await courses_collection.find_one({"_id": ObjectId(course_id)})
    print(
        f"[DEBUG PUT] Updated course is_first_session_free: {updated.get('is_first_session_free')}"
    )

    old_session_titles = existing.get("session_titles", [])
    new_session_titles = updated.get("session_titles", [])
    
    if len(new_session_titles) > len(old_session_titles):
        new_sessions_count = len(new_session_titles) - len(old_session_titles)
        new_sessions = new_session_titles[-new_sessions_count:] if new_session_titles else []
        
        from database import enrollments_collection, notifications_collection
        from datetime import datetime
        
        enrolled_users = await enrollments_collection.find({"course_id": course_id}).to_list(None)
        
        if enrolled_users and new_sessions:
            notifications = []
            course_title = existing.get("title", "the course")
            
            for enrollment in enrolled_users:
                user_id = enrollment.get("user_id")
                if not user_id:
                    continue
                    
                for session_title in new_sessions:
                    notifications.append({
                        "user_id": user_id,
                        "course_id": course_id,
                        "session_title": session_title,
                        "message": f"A new session '{session_title}' has been added to your course '{course_title}'!",
                        "type": "course_update",
                        "is_read": False,
                        "created_at": datetime.utcnow(),
                    })
            
            if notifications:
                await notifications_collection.insert_many(notifications)

    response = course_helper(updated)
    response["category_names"] = await get_category_names(updated.get("category_ids", []))
    return response


@router.delete("/{course_id}")
async def delete_course(course_id: str, admin: UserResponse = Depends(get_admin_user)):
    result = await courses_collection.delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}


@router.post("/extract-metadata")
async def extract_metadata(urls: List[str]):
    from services.youtube import get_video_metadata

    metadata = get_video_metadata(urls)
    return {"metadata": metadata}


@router.post("/ai/generate-title")
async def enhance_course_title(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    try:
        enhanced = await course_ai.generate_course_title(title)
        return {"title": enhanced}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/generate-description")
async def generate_course_description(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    try:
        description = await course_ai.generate_course_description(title)
        return {"description": description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/generate-details")
async def generate_course_learnings(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    description = payload.get("description")
    if not title or not description:
        raise HTTPException(status_code=400, detail="Title and Description are required")
    
    try:
        learnings = await course_ai.generate_course_learnings(title, description)
        return {"learnings": learnings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{course_id}/progress", response_model=List[UserProgressResponse])
async def get_course_progress(
    course_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    progress = []
    async for doc in user_progress_collection.find(
        {"course_id": course_id, "user_id": current_user.id}
    ):
        doc["user_id"] = doc.get("user_id", "")
        doc["updated_at"] = doc.get("updated_at", datetime.utcnow())
        progress.append(doc)
    return progress


@router.post("/{course_id}/progress", response_model=UserProgressResponse)
async def save_course_progress(
    course_id: str,
    progress_data: UserProgressCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    progress_doc = {
        "user_id": current_user.id,
        "course_id": course_id,
        "session_idx": progress_data.session_idx,
        "timestamp": progress_data.timestamp,
        "completed": progress_data.completed,
        "updated_at": datetime.utcnow(),
    }

    existing = await user_progress_collection.find_one(
        {
            "course_id": course_id,
            "user_id": current_user.id,
            "session_idx": progress_data.session_idx,
        }
    )

    if existing:
        await user_progress_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "timestamp": progress_data.timestamp,
                    "completed": progress_data.completed,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        progress_doc["_id"] = existing["_id"]
        progress_doc["completed"] = progress_data.completed
    else:
        result = await user_progress_collection.insert_one(progress_doc)
        progress_doc["_id"] = result.inserted_id

    return progress_doc
