import os
import ssl
from fastapi import FastAPI
from app.routes import profiles
from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
from app.routes import diagnosis_routes, user
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Automation Profiles API")

# Create an SSL context (default system settings)
ssl_context = ssl.create_default_context()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all (not recommended in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_tortoise(
    app,
    db_url=os.getenv("DATABASE_URL"),
    modules={"models": ["app.models.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
    
)

# Include the profiles router with a prefix "/profiles"
app.include_router(profiles.router, prefix="/profiles", tags=["Automation Profiles"])
app.include_router(diagnosis_routes.router)
app.include_router(user.router) 
@app.get("/")
async def root():
    return {"message": "FastAPI with Tortoise ORM is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("mainModule:app", host="0.0.0.0", port=8000, reload=True)

@app.get("/test")
async def test_route():
    return {"message": "Test successful"}