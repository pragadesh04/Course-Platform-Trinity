from fastapi import APIRouter
from pydantic import BaseModel
from ..services.telegram import send_telegram_message, format_contact_message

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactForm(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str


@router.post("/send")
async def send_contact_message(contact: ContactForm):
    formatted = format_contact_message(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        message=contact.message,
    )
    await send_telegram_message(formatted)
    return {"success": True}
