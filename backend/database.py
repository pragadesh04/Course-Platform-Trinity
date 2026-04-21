from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

users_collection = db["users"]
categories_collection = db["categories"]
courses_collection = db["courses"]
products_collection = db["products"]
orders_collection = db["orders"]
testimonials_collection = db["testimonials"]
gallery_collection = db["gallery"]
settings_collection = db["settings"]
comments_collection = db["comments"]
feedbacks_collection = db["feedbacks"]
coupons_collection = db["coupons"]
user_progress_collection = db["user_progress"]
