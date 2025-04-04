# app/auth.py
from fastapi_users import FastAPIUsers, BaseUserManager, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from app.models.models import User
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from fastapi import Request
import uuid
from tortoise import Tortoise
from fastapi_users import schemas
from passlib.context import CryptContext
from fastapi_users.password import PasswordHelper

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET = "YOUR_SECRET_KEY_HERE"

# Define the User schema for responses
class UserRead(BaseModel):
    id: uuid.UUID
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False
    is_paid_user: bool = False

    class Config:
        from_attributes = True

# Define the User creation schema for requests
class UserCreate(schemas.BaseUserCreate):
    email: EmailStr
    password: str

# Custom Tortoise User Database Adapter
class TortoiseUserDB:
    async def create(self, user_dict: Dict[str, Any]) -> User:
        user = User(**user_dict)
        await user.save()
        return user

    async def get(self, id: str) -> Optional[User]:
        return await User.get_or_none(id=id)

    async def get_by_email(self, email: str) -> Optional[User]:
        return await User.get_or_none(email=email)

    # Modified update method to accept user object and update_dict separately
    async def update(self, user: User, update_dict: Dict[str, Any]) -> User:
        for key, value in update_dict.items():
            setattr(user, key, value)
        await user.save()
        return user

    async def delete(self, user_dict: Dict[str, Any]) -> None:
        user = await User.get(id=user_dict["id"])
        await user.delete()

class UserManager(UUIDIDMixin, BaseUserManager[User, str]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    password_helper = PasswordHelper(pwd_context)
    # PasswordHelper(
    #     CryptContext(schemes=["argon2"], deprecated="auto")
    # )

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")
    
    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        print(f"User {user.id} has forgot their password. Reset token: {token}")
    
    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

async def get_user_manager():
    conn = Tortoise.get_connection("default")
    user_db = TortoiseUserDB()
    yield UserManager(user_db)

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, str](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)