# mainModule.py
import os
import ssl
from fastapi import FastAPI, Request
from app.routes import profiles, diagnosis_routes, user, automation, runs
from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.auth import fastapi_users, auth_backend, UserRead, UserCreate

load_dotenv()

app = FastAPI(title="Automation Profiles API")

# Create an SSL context (default system settings)
ssl_context = ssl.create_default_context()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Tortoise ORM
register_tortoise(
    app,
    db_url=os.getenv("DATABASE_URL"),
    modules={"models": ["app.models.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

# Include routers
app.include_router(profiles.router, prefix="/profiles", tags=["Automation Profiles"])
app.include_router(diagnosis_routes.router)
app.include_router(user.router)
app.include_router(runs.router)

app.include_router(
    automation.router,
    prefix="/automation",
    tags=["automation"],
)
app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

@app.get("/")
async def root():
    return {"message": "FastAPI with Tortoise ORM is running!"}

@app.get("/test")
async def test_route():
    return {"message": "Test successful"}
@app.post("/debug-login")
async def debug_login(request: Request):
    data = await request.body()
    print("Raw body:", data)
    return {"status": "received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("mainModule:app", host="0.0.0.0", port=8000, reload=True)