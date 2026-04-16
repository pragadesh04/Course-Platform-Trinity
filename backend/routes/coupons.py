from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from ..database import coupons_collection
from ..schemas import UserResponse
from ..auth import get_admin_user

router = APIRouter(prefix="/coupons", tags=["Coupons"])


class CouponCreate(BaseModel):
    code: str
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    min_order_amount: float = 0
    max_uses: int = 100
    expires_at: datetime = None
    active: bool = True


class CouponResponse(BaseModel):
    id: str
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    uses: int
    max_uses: int
    expires_at: datetime
    active: bool


class ValidateCoupon(BaseModel):
    code: str


def coupon_helper(coupon) -> CouponResponse:
    return CouponResponse(
        id=str(coupon["_id"]),
        code=coupon["code"],
        discount_type=coupon["discount_type"],
        discount_value=coupon["discount_value"],
        min_order_amount=coupon.get("min_order_amount", 0),
        uses=coupon.get("uses", 0),
        max_uses=coupon.get("max_uses", 100),
        expires_at=coupon.get("expires_at"),
        active=coupon.get("active", True),
    )


@router.get("", response_model=list[CouponResponse])
async def get_coupons(admin: UserResponse = Depends(get_admin_user)):
    coupons = []
    async for coupon in coupons_collection.find().sort("created_at", -1):
        coupons.append(coupon_helper(coupon))
    return coupons


@router.post("", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate, admin: UserResponse = Depends(get_admin_user)
):
    coupon_doc = {
        **coupon_data.model_dump(),
        "code": coupon_data.code.upper(),
        "uses": 0,
        "created_at": datetime.utcnow(),
    }
    result = await coupons_collection.insert_one(coupon_doc)
    coupon_doc["_id"] = result.inserted_id
    return coupon_helper(coupon_doc)


@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: UserResponse = Depends(get_admin_user)):
    from bson import ObjectId

    result = await coupons_collection.delete_one({"_id": ObjectId(coupon_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}


@router.post("/validate")
async def validate_coupon(data: ValidateCoupon):
    code = data.code.upper()
    coupon = await coupons_collection.find_one({"code": code})

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")

    if not coupon.get("active", True):
        raise HTTPException(status_code=400, detail="Coupon is no longer active")

    if coupon.get("expires_at") and coupon["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Coupon has expired")

    if coupon.get("uses", 0) >= coupon.get("max_uses", 100):
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    return {
        "valid": True,
        "code": coupon["code"],
        "discount": {
            "type": coupon["discount_type"],
            "value": coupon["discount_value"],
        },
        "min_order_amount": coupon.get("min_order_amount", 0),
    }
