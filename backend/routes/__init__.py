from .auth import router as auth_router
from .categories import router as categories_router
from .courses import router as courses_router
from .products import router as products_router
from .orders import router as orders_router
from .testimonials import router as testimonials_router
from .gallery import router as gallery_router
from .settings import router as settings_router
from .upload import router as upload_router
from .contact import router as contact_router
from .comments import router as comments_router
from .feedbacks import router as feedbacks_router
from .coupons import router as coupons_router
from .payments import router as payments_router
from .enrollments import router as enrollments_router
from .notifications import router as notifications_router

routers = [
    auth_router,
    categories_router,
    courses_router,
    products_router,
    orders_router,
    testimonials_router,
    gallery_router,
    settings_router,
    upload_router,
    contact_router,
    comments_router,
    feedbacks_router,
    coupons_router,
    payments_router,
    enrollments_router,
    notifications_router,
]
