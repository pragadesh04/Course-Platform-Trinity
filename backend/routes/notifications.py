from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import notifications_collection
from schemas import NotificationCreate, NotificationResponse, UserResponse
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def notification_helper(notification) -> dict:
    return {
        "id": str(notification["_id"]),
        "user_id": notification["user_id"],
        "course_id": notification["course_id"],
        "session_title": notification.get("session_title", ""),
        "message": notification["message"],
        "type": notification.get("type", "course_update"),
        "is_read": notification.get("is_read", False),
        "created_at": notification.get("created_at", datetime.utcnow()),
    }


@router.get("", response_model=List[NotificationResponse])
async def get_notifications(current_user: UserResponse = Depends(get_current_user)):
    notifications = []
    async for doc in notifications_collection.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(50):
        notifications.append(notification_helper(doc))
    return notifications


@router.get("/unread-count")
async def get_unread_count():
    try:
        count = await notifications_collection.count_documents({
            "is_read": False
        })
        return {"count": count}
    except Exception as e:
        return {"count": 0, "error": str(e)}


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_as_read(current_user: UserResponse = Depends(get_current_user)):
    await notifications_collection.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All marked as read"}