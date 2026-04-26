from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import products_collection, categories_collection
from schemas import ProductCreate, ProductUpdate, ProductResponse, UserResponse
from auth import get_admin_user
from utils.ai import product_ai

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/ai/generate-title")
async def enhance_product_title(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    enhanced = await product_ai.generate_title(title)
    return {"title": enhanced}


@router.post("/ai/generate-description")
async def generate_product_description(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    description = await product_ai.generate_description(title)
    return {"description": description}


@router.post("/ai/generate-features")
async def generate_product_features(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    description = payload.get("description")
    if not title or not description:
        raise HTTPException(status_code=400, detail="Title and Description are required")
    
    features = await product_ai.generate_features(title, description)
    return {"features": features}


@router.post("/ai/generate-tags")
async def generate_product_tags(
    payload: dict, admin: UserResponse = Depends(get_admin_user)
):
    title = payload.get("title")
    description = payload.get("description")
    if not title or not description:
        raise HTTPException(status_code=400, detail="Title and Description are required")
    
    tags = await product_ai.generate_tags(title, description)
    return {"tags": tags}


def product_helper(product, include_categories: bool = False) -> ProductResponse:
    response = ProductResponse(
        id=str(product["_id"]),
        title=product["title"],
        description=product["description"],
        price=product["price"],
        thumbnail_url=product.get("thumbnail_url", ""),
        key_features=product.get("key_features", []),
        tags=product.get("tags", []),
        category_ids=product.get("category_ids", []),
        featured=product.get("featured", False),
        created_at=product["created_at"],
        images=product.get("images", []),
        category_names=[],
    )
    return response


async def get_category_names(category_ids: List[str]) -> List[str]:
    names = []
    for cat_id in category_ids:
        try:
            category = await categories_collection.find_one({"_id": ObjectId(cat_id)})
            if category:
                names.append(category.get("name", ""))
        except:
            pass
    return names


@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_ids: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
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
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}

    products = []
    async for product in products_collection.find(query).sort("created_at", -1):
        prod = product_helper(product)
        prod.category_names = await get_category_names(product.get("category_ids", []))
        products.append(prod)
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    prod = product_helper(product, include_categories=True)
    prod.category_names = await get_category_names(product.get("category_ids", []))
    return prod


@router.post("", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate, admin: UserResponse = Depends(get_admin_user)
):
    product_doc = product_data.model_dump()
    product_doc["category_ids"] = product_doc.get("category_ids", [])
    product_doc["created_at"] = datetime.utcnow()

    result = await products_collection.insert_one(product_doc)
    product_doc["_id"] = result.inserted_id

    prod = product_helper(product_doc)
    prod.category_names = await get_category_names(product_data.category_ids or [])
    return prod


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    admin: UserResponse = Depends(get_admin_user),
):
    existing = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_data.model_dump(exclude_unset=True, exclude_none=True)

    await products_collection.update_one(
        {"_id": ObjectId(product_id)}, {"$set": update_data}
    )

    updated = await products_collection.find_one({"_id": ObjectId(product_id)})
    prod = product_helper(updated)
    prod.category_names = await get_category_names(updated.get("category_ids", []))
    return prod


@router.delete("/{product_id}")
async def delete_product(
    product_id: str, admin: UserResponse = Depends(get_admin_user)
):
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}