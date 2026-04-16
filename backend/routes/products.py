from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import products_collection
from schemas import ProductCreate, ProductUpdate, ProductResponse, UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/products", tags=["Products"])


def product_helper(product) -> ProductResponse:
    return ProductResponse(
        id=str(product["_id"]),
        title=product["title"],
        description=product["description"],
        price=product["price"],
        thumbnail_url=product.get("thumbnail_url", ""),
        key_features=product.get("key_features", []),
        tags=product.get("tags", []),
        category_id=product.get("category_id"),
        featured=product.get("featured", False),
        created_at=product["created_at"],
    )


@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}

    products = []
    async for product in products_collection.find(query).sort("created_at", -1):
        products.append(product_helper(product))
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(product)


@router.post("", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate, admin: UserResponse = Depends(get_admin_user)
):
    product_doc = {**product_data.model_dump(), "created_at": datetime.utcnow()}

    result = await products_collection.insert_one(product_doc)
    product_doc["_id"] = result.inserted_id

    return product_helper(product_doc)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    admin: UserResponse = Depends(get_admin_user),
):
    existing = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_data.model_dump(exclude_unset=True)

    await products_collection.update_one(
        {"_id": ObjectId(product_id)}, {"$set": update_data}
    )

    updated = await products_collection.find_one({"_id": ObjectId(product_id)})
    return product_helper(updated)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str, admin: UserResponse = Depends(get_admin_user)
):
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
