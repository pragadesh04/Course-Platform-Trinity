from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import routers

app = FastAPI(
    title="Trinity API",
    description="Tailoring E-learning & E-commerce Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Trinity API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
