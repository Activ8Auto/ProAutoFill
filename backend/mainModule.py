# mainModule.py
import os
import ssl
from fastapi import FastAPI, Request
from app.routes import profiles, diagnosis_routes, user, automation, runs, stripe_routes
from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from app.auth import fastapi_users, auth_backend, UserRead, UserCreate

app = FastAPI(title="Automation Profiles API")

# Log startup
logger.info("Starting application...")

# Create an SSL context (default system settings)
ssl_context = ssl.create_default_context()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware added")

# Register Tortoise ORM
logger.info(f"Registering Tortoise ORM with DB_URL: {os.getenv('DATABASE_URL')}")
register_tortoise(
    app,
    db_url=os.getenv("DATABASE_URL"),
    modules={"models": ["app.models.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
logger.info("Tortoise ORM registered")

# Include routers
app.include_router(profiles.router, prefix="/profiles", tags=["Automation Profiles"])
app.include_router(diagnosis_routes.router)
app.include_router(user.router)
app.include_router(runs.router)
app.include_router(stripe_routes.router)
app.include_router(automation.router, prefix="/automation", tags=["automation"])
app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
logger.info("All routers included")

@app.on_event("startup")
async def startup_event():
    logger.info("Startup event triggered")
    from app.models.models import User
    try:
        count = await User.all().count()
        logger.info(f"Database connection test: {count} users found")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

@app.get("/")
async def root():
    logger.info("Root endpoint hit")
    return {"message": "FastAPI with Tortoise ORM is running!"}

@app.get("/test")
async def test_route():
    logger.info("Test endpoint hit")
    return {"message": "Test successful"}

@app.post("/debug-login")
async def debug_login(request: Request):
    data = await request.body()
    logger.info(f"Debug login received: {data}")
    return {"status": "received"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server...")
    uvicorn.run("mainModule:app", host="0.0.0.0", port=8000, reload=True)