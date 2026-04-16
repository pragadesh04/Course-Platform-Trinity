from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from database import comments_collection, orders_collection
from schemas import UserResponse, UserRole
from auth import get_current_user, get_admin_user

router = APIRouter(prefix="/comments", tags=["Comments"])


class ReplyModel(BaseModel):
    text: str
    replied_at: datetime
    is_admin: bool = True


class CommentCreate(BaseModel):
    text: str


class ReplyCreate(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: str
    course_id: str
    session_index: int
    user_id: str
    user_name: str
    text: str
    created_at: datetime
    replies: List[ReplyModel] = []


def comment_helper(comment) -> CommentResponse:
    return CommentResponse(
        id=str(comment["_id"]),
        course_id=str(comment.get("course_id", "")),
        session_index=int(comment.get("session_index", 0)),
        user_id=str(comment.get("user_id", "")),
        user_name=str(comment.get("user_name", "Unknown")),
        text=str(comment.get("text", "")),
        created_at=comment.get("created_at") or datetime.utcnow(),
        replies=[ReplyModel(**r) for r in comment.get("replies", []) if isinstance(r, dict)],
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


@router.get("/all/all", response_model=List[CommentResponse])
async def get_all_comments(admin: UserResponse = Depends(get_admin_user)):
    comments = []
    async for comment in comments_collection.find().sort("created_at", -1):
        comments.append(comment_helper(comment))
    return comments


@router.get("/{course_id}/{session_index}", response_model=List[CommentResponse])
async def get_comments(course_id: str, session_index: int):
    comments = []
    async for comment in comments_collection.find(
        {
            "course_id": course_id,
            "session_index": session_index,
        }
    ).sort("created_at", -1):
        comments.append(comment_helper(comment))
    return comments


@router.post("/{course_id}/{session_index}", response_model=CommentResponse)
async def create_comment(
    course_id: str,
    session_index: int,
    data: CommentCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    is_enrolled = await check_enrollment(current_user.id, course_id)
    if not is_enrolled:
        raise HTTPException(status_code=403, detail="You must be enrolled to comment")

    comment_doc = {
        "course_id": course_id,
        "session_index": session_index,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "text": data.text,
        "created_at": datetime.utcnow(),
        "replies": [],
    }

    result = await comments_collection.insert_one(comment_doc)
    comment_doc["_id"] = result.inserted_id

    return comment_helper(comment_doc)


@router.post("/{comment_id}/reply", response_model=CommentResponse)
async def reply_to_comment(
    comment_id: str,
    data: ReplyCreate,
    admin: UserResponse = Depends(get_admin_user),
):
    reply = ReplyModel(
        text=data.text,
        replied_at=datetime.utcnow(),
        is_admin=True,
    )

    await comments_collection.update_one(
        {"_id": ObjectId(comment_id)},
        {"$push": {"replies": reply.model_dump()}},
    )

    comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return comment_helper(comment)


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    result = await comments_collection.delete_one({"_id": ObjectId(comment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted"}
