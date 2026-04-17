import razorpay
import hashlib
import hmac
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from config import settings
from database import orders_collection, users_collection
from schemas import (
    OrderItem,
    OrderResponse,
    OrderStatus,
    UserResponse,
    PaymentCreateRequest,
    PaymentVerifyRequest,
)
from auth import get_current_user
from services.telegram import send_telegram_message

router = APIRouter(prefix="/payments", tags=["Payments"])


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


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


@router.post("/create")
async def create_payment_order(
    payment_data: PaymentCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    if not payment_data.items:
        raise HTTPException(status_code=400, detail="No items in order")

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")

    subtotal = sum(item.price for item in payment_data.items)
    discount = payment_data.coupon_discount or 0
    total = subtotal - discount

    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid order total")

    user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    user_name = user.get("name", "Unknown") if user else "Unknown"

    item_names = ", ".join([item.title for item in payment_data.items])

    razorpay_order = get_razorpay_client().order.create(
        {
            "amount": int(total * 100),
            "currency": "INR",
            "receipt": f"order_{datetime.utcnow().timestamp()}",
            "notes": {
                "user_id": current_user.id,
                "items": item_names,
            },
        }
    )

    order_doc = {
        "user_id": current_user.id,
        "user_name": user_name,
        "items": [item.model_dump() for item in payment_data.items],
        "subtotal": subtotal,
        "total": total,
        "coupon_code": payment_data.coupon_code,
        "coupon_discount": discount,
        "razorpay_order_id": razorpay_order["id"],
        "status": OrderStatus.PENDING.value,
        "created_at": datetime.utcnow(),
    }

    result = await orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id

    return {
        "order_id": str(result.inserted_id),
        "razorpay_order_id": razorpay_order["id"],
        "amount": total,
        "currency": "INR",
        "key": settings.RAZORPAY_KEY_ID,
    }


@router.post("/verify")
async def verify_payment(
    verify_data: PaymentVerifyRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    order = await orders_collection.find_one(
        {
            "razorpay_order_id": verify_data.razorpay_order_id,
            "user_id": current_user.id,
        }
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] == OrderStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Order already completed")

    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{verify_data.razorpay_order_id}|{verify_data.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if generated_signature != verify_data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    await orders_collection.update_one(
        {"razorpay_order_id": verify_data.razorpay_order_id},
        {
            "$set": {
                "status": OrderStatus.COMPLETED.value,
                "razorpay_payment_id": verify_data.razorpay_payment_id,
                "razorpay_signature": verify_data.razorpay_signature,
                "paid_at": datetime.utcnow(),
            }
        },
    )

    item_names = ", ".join([item["title"] for item in order["items"]])
    user_name = order.get("user_name", "Unknown")

    await send_telegram_message(
        f"""<b>💰 New Payment Received!</b>

<b>👤 Customer:</b> {user_name}
<b>📧 User ID:</b> {current_user.id}
<b>🛒 Items:</b> {item_names}
<b>💵 Amount:</b> ₹{order["total"]}
<b>📋 Order ID:</b> {str(order["_id"])}
<b>🔖 Razorpay Payment ID:</b> {verify_data.razorpay_payment_id}"""
    )

    return {"status": "success", "message": "Payment verified successfully"}


@router.post("/webhook")
async def razorpay_webhook(payload: dict):
    event = payload.get("event")

    if event == "payment.captured":
        payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment.get("order_id")

        if order_id:
            await orders_collection.update_one(
                {"razorpay_order_id": order_id},
                {
                    "$set": {
                        "status": OrderStatus.COMPLETED.value,
                        "razorpay_payment_id": payment.get("id"),
                        "paid_at": datetime.utcnow(),
                    }
                },
            )

    elif event == "payment.failed":
        payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment.get("order_id")

        if order_id:
            order = await orders_collection.find_one({"razorpay_order_id": order_id})
            if order:
                user_name = order.get("user_name", "Unknown")
                item_names = ", ".join([item["title"] for item in order["items"]])

                await send_telegram_message(
                    f"""<b>❌ Payment Failed!</b>

<b>👤 Customer:</b> {user_name}
<b>🛒 Items:</b> {item_names}
<b>💵 Amount:</b> ₹{order["total"]}
<b>🔖 Razorpay Payment ID:</b> {payment.get("id")}
<b>📝 Error:</b> {payment.get("error_description", "Unknown error")}"""
                )

    return {"status": "ok"}


@router.get("/order/{razorpay_order_id}")
async def get_order_by_razorpay_id(
    razorpay_order_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    order = await orders_collection.find_one(
        {
            "razorpay_order_id": razorpay_order_id,
            "user_id": current_user.id,
        }
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order_helper(order)
