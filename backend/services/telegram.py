import httpx
from ..config import settings


async def send_telegram_message(text: str) -> bool:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_ADMIN_IDS:
        return False

    admin_ids = [
        id.strip() for id in settings.TELEGRAM_ADMIN_IDS.split(",") if id.strip()
    ]

    async with httpx.AsyncClient() as client:
        for admin_id in admin_ids:
            try:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={
                        "chat_id": admin_id,
                        "text": text,
                        "parse_mode": "HTML",
                    },
                    timeout=10.0,
                )
            except Exception:
                pass

    return True


def format_contact_message(name: str, email: str, phone: str, message: str) -> str:
    return f"""<b>📬 New Contact Form Message</b>

<b>👤 Name:</b> {name}
<b>📱 Phone:</b> {phone or "Not provided"}
<b>📧 Email:</b> {email}

<b>💬 Message:</b>
{message}"""
