from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from database import (
    orders_collection,
    courses_collection,
    products_collection,
    users_collection,
)
from schemas import OrderCreate, OrderResponse, OrderItem, OrderStatus, UserResponse
from auth import get_current_user, get_admin_user

router = APIRouter(prefix="/orders", tags=["Orders"])


def order_helper(order) -> OrderResponse:
    return OrderResponse(
        id=str(order["_id"]),
        user_id=order["user_id"],
        items=[OrderItem(**item) for item in order["items"]],
        total=order["total"],
        coupon_code=order.get("coupon_code"),
        coupon_discount=order.get("coupon_discount"),
        razorpay_order_id=order.get("razorpay_order_id"),
        razorpay_payment_id=order.get("razorpay_payment_id"),
        razorpay_signature=order.get("razorpay_signature"),
        status=OrderStatus(order["status"]),
        created_at=order["created_at"],
        paid_at=order.get("paid_at"),
    )


@router.get("", response_model=List[OrderResponse])
async def get_my_orders(current_user: UserResponse = Depends(get_current_user)):
    orders = []
    async for order in orders_collection.find({"user_id": current_user.id}).sort(
        "created_at", -1
    ):
        orders.append(order_helper(order))
    return orders


@router.get("/all", response_model=List[OrderResponse])
async def get_all_orders(admin: UserResponse = Depends(get_admin_user)):
    orders = []
    async for order in orders_collection.find().sort("created_at", -1):
        orders.append(order_helper(order))
    return orders


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate, current_user: UserResponse = Depends(get_current_user)
):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="No items in order")

    total = sum(item.price for item in order_data.items)

    order_doc = {
        "user_id": current_user.id,
        "items": [item.model_dump() for item in order_data.items],
        "total": total,
        "payment_method": order_data.payment_method.value,
        "status": OrderStatus.COMPLETED.value,
        "created_at": datetime.utcnow(),
    }

    result = await orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id

    return order_helper(order_doc)


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str, status: OrderStatus, admin: UserResponse = Depends(get_admin_user)
):
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)}, {"$set": {"status": status.value}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}
