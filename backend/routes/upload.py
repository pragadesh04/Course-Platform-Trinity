import cloudinary
import cloudinary.uploader
import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Optional
from config import settings
from schemas import UserResponse
from auth import get_admin_user

router = APIRouter(prefix="/upload", tags=["Upload"])

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_file(file: UploadFile) -> bool:
    if not file.filename:
        return False
    ext = file.filename.split(".")[-1].lower()
    return ext in ALLOWED_EXTENSIONS


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: Optional[UserResponse] = Depends(get_admin_user),
):
    if not validate_file(file):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Allowed: jpg, png, webp, gif"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size: 5MB")

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(contents),
            folder="course_better",
            resource_type="image",
            filename=file.filename,
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/image/{public_id}")
async def delete_image(
    public_id: str,
    admin: UserResponse = Depends(get_admin_user),
):
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        if result.get("result") == "ok":
            return {"success": True, "message": "Image deleted"}
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
