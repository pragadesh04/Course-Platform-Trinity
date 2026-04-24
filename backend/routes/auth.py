from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from database import users_collection, orders_collection
from schemas import UserCreate, UserLogin, UserResponse, Token, UserRole
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from routes.enrollments import claim_enrollments_for_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await users_collection.find_one(
        {"mobile_number": user_data.mobile_number}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered",
        )
    print(user_data.password)
    user_doc = {
        "name": user_data.name,
        "mobile_number": user_data.mobile_number,
        "password": get_password_hash(user_data.password),
        "role": UserRole.USER.value,
        "created_at": datetime.utcnow(),
    }

    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    user_id = str(result.inserted_id)

    user_response = UserResponse(
        id=user_id,
        name=user_doc["name"],
        mobile_number=user_doc["mobile_number"],
        role=UserRole(user_doc["role"]),
        created_at=user_doc["created_at"],
    )

    access_token = create_access_token(data={"sub": user_id, "role": user_doc["role"]})

    claimed_enrollments = await claim_enrollments_for_user(
        user_id, user_data.mobile_number
    )

    await orders_collection.update_many(
        {"mobile_number": user_data.mobile_number, "user_id": ""},
        {"$set": {"user_id": user_id}}
    )

    return Token(access_token=access_token, user=user_response)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"mobile_number": credentials.mobile_number})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or password",
        )

    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        mobile_number=user["mobile_number"],
        role=UserRole(user["role"]),
        created_at=user["created_at"],
    )

    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    user_id = str(user["_id"])
    await orders_collection.update_many(
        {"mobile_number": user["mobile_number"], "user_id": ""},
        {"$set": {"user_id": user_id}}
    )

    return Token(access_token=access_token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
