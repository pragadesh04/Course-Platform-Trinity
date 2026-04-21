from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import categories_collection
from schemas import CategoryCreate, CategoryResponse, UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/categories", tags=["Categories"])


def category_helper(category) -> CategoryResponse:
    return CategoryResponse(
        id=str(category["_id"]),
        name=category["name"],
        slug=category["slug"],
        type=category["type"],
        created_at=category["created_at"],
    )


@router.get("", response_model=List[CategoryResponse])
async def get_categories(type: str = None):
    query = {}
    if type:
        query["type"] = type

    categories = []
    async for category in categories_collection.find(query).sort("name", 1):
        categories.append(category_helper(category))
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    category = await categories_collection.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category_helper(category)


@router.post("", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate, admin: UserResponse = Depends(get_admin_user)
):
    existing = await categories_collection.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")

    category_doc = {
        **category_data.model_dump(),
        "type": category_data.type.value,
        "created_at": datetime.utcnow(),
    }

    result = await categories_collection.insert_one(category_doc)
    category_doc["_id"] = result.inserted_id

    return category_helper(category_doc)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryCreate,
    admin: UserResponse = Depends(get_admin_user),
):
    existing = await categories_collection.find_one({"_id": ObjectId(category_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = {**category_data.model_dump(), "type": category_data.type.value}

    await categories_collection.update_one(
        {"_id": ObjectId(category_id)}, {"$set": update_data}
    )

    updated = await categories_collection.find_one({"_id": ObjectId(category_id)})
    return category_helper(updated)


@router.delete("/{category_id}")
async def delete_category(
    category_id: str, admin: UserResponse = Depends(get_admin_user)
):
    result = await categories_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
