from datetime import datetime, timedelta
from schemas.enrollment import EnrollmentDuration


def calculate_expiry(
    duration: EnrollmentDuration, start_date: datetime = None
) -> datetime:
    if start_date is None:
        start_date = datetime.utcnow()

    if duration == EnrollmentDuration.M3:
        return start_date + timedelta(days=90)
    elif duration == EnrollmentDuration.M6:
        return start_date + timedelta(days=180)
    else:
        return datetime.utcnow() + timedelta(days=3650)
