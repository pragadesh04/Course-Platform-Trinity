from fastapi import APIRouter, Depends
from datetime import datetime
from database import (
    settings_collection,
    users_collection,
    courses_collection,
    products_collection,
    orders_collection,
    user_progress_collection,
)
from schemas import UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/settings", tags=["Settings"])


def round_students(count):
    if count >= 1000:
        return f"{(count // 1000) * 1000}+"
    elif count >= 100:
        return "100+"
    elif count >= 50:
        return "50+"
    elif count >= 10:
        return f"{((count // 10) * 10)}+"
    return str(count)


@router.get("/about")
async def get_about_settings():
    settings = await settings_collection.find_one({"key": "about"})
    if settings:
        return settings.get(
            "data",
            {
                "experience_years": 10,
                "mission": "Our mission is to make quality tailoring education accessible to everyone.",
                "about_text": "We are dedicated to preserving traditional tailoring skills while embracing modern techniques.",
            },
        )
    return {
        "experience_years": 10,
        "mission": "Our mission is to make quality tailoring education accessible to everyone.",
        "about_text": "We are dedicated to preserving traditional tailoring skills while embracing modern techniques.",
    }


@router.put("/about")
async def update_about_settings(
    data: dict, admin: UserResponse = Depends(get_admin_user)
):
    await settings_collection.update_one(
        {"key": "about"},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"message": "About settings updated"}


@router.get("/contact")
async def get_contact_settings():
    settings = await settings_collection.find_one({"key": "contact"})
    if settings:
        return settings.get(
            "data",
            {
                "phone": "",
                "email": "",
                "address": "",
                "whatsapp": "",
                "instagram": "",
                "facebook": "",
            },
        )
    return {
        "phone": "",
        "email": "",
        "address": "",
        "whatsapp": "",
        "instagram": "",
        "facebook": "",
    }


@router.put("/contact")
async def update_contact_settings(
    data: dict, admin: UserResponse = Depends(get_admin_user)
):
    await settings_collection.update_one(
        {"key": "contact"},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"message": "Contact settings updated"}


@router.get("/founder")
async def get_founder_info():
    settings = await settings_collection.find_one({"key": "founder"})
    if settings:
        return settings.get(
            "data",
            {
                "name": "Founder",
                "title": "Founder & Master Tailor",
                "bio": "",
                "image_url": "",
            },
        )
    return {
        "name": "Founder",
        "title": "Founder & Master Tailor",
        "bio": "",
        "image_url": "",
    }


@router.put("/founder")
async def update_founder_info(
    data: dict, admin: UserResponse = Depends(get_admin_user)
):
    await settings_collection.update_one(
        {"key": "founder"},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"message": "Founder info updated"}


@router.get("/stats")
async def get_stats():
    courses_count = await courses_collection.count_documents({})
    products_count = await products_collection.count_documents({})
    orders_count = await orders_collection.count_documents({})
    users_count = await users_collection.count_documents({})

    unique_students_cursor = user_progress_collection.distinct("user_id")
    unique_students = await unique_students_cursor
    students_count = len(unique_students)

    about_settings = await settings_collection.find_one({"key": "about"})
    about_data = about_settings.get("data", {}) if about_settings else {}

    display_students = round_students(students_count)
    display_experience = about_data.get("experience_years", 10)
    display_courses = (
        str(courses_count) if courses_count < 50 else f"{((courses_count // 10) * 10)}+"
    )

    return {
        "courses": courses_count,
        "courses_display": display_courses,
        "products": products_count,
        "orders": orders_count,
        "users": users_count,
        "students": students_count,
        "students_display": display_students,
        "experience_years": display_experience,
    }


@router.get("/hero")
async def get_hero_settings():
    settings = await settings_collection.find_one({"key": "hero"})
    if settings:
        return settings.get(
            "data",
            {
                "title": "Master the Art of Tailoring",
                "subtitle": "Learn professional dressmaking, alterations, and crafting from industry experts. Transform your passion into a profitable skill.",
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
            },
        )
    return {
        "title": "Master the Art of Tailoring",
        "subtitle": "Learn professional dressmaking, alterations, and crafting from industry experts. Transform your passion into a profitable skill.",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    }


@router.put("/hero")
async def update_hero_settings(
    data: dict, admin: UserResponse = Depends(get_admin_user)
):
    await settings_collection.update_one(
        {"key": "hero"},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"message": "Hero settings updated"}
