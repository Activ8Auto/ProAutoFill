# app/auth.py
from fastapi_users import FastAPIUsers, BaseUserManager, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users.jwt import decode_jwt
import os
from app.models.models import (
    User,
    DiagnosisEntry,
    DiagnosisPhysicalExam,
    DiagnosisLaboratoryTest,
    DiagnosisTeaching,
    DiagnosisCurrentMedication,
    DiagnosisPrescribedMedication
)
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from fastapi import Request
import uuid
from tortoise import Tortoise
from fastapi_users import schemas
from passlib.context import CryptContext
from fastapi_users.password import PasswordHelper
from dotenv import load_dotenv
import logging
load_dotenv()
SECRET = os.getenv("SECRET_KEY_AUTH")

if not SECRET:
    raise ValueError("SECRET_KEY_AUTH is not set in the environment!")

# Set up logging
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        """Copy diagnoses from the template user to the new user after registration."""
        logger.info(f"User {user.id} has registered.")
        try:
            # Replace 'template@example.com' with the actual email of your template user
            template_user = await User.get(id="3dadcb05-8154-4340-b39e-3ed2c93d41a5")
            if not template_user:
                logger.warning("Template user not found, no diagnoses copied.")
                return

            # Fetch all diagnoses from the template user with related objects
            template_diagnoses = await DiagnosisEntry.filter(user=template_user).prefetch_related(
                "physical_exams",
                "laboratory_tests",
                "teachings",
                "current_medications",
                "prescribed_medications"
            )

            # Copy each diagnosis and its related objects
            for diag in template_diagnoses:
                # Create a new diagnosis for the new user
                new_diag = await DiagnosisEntry.create(
                    user=user,
                    name=diag.name,
                    icd_code=diag.icd_code,
                    exclusion_group=diag.exclusion_group
                )

                # Copy related objects using bulk_create for efficiency
                physical_exams = [
                    DiagnosisPhysicalExam(diagnosis=new_diag, exam=exam.exam)
                    for exam in await diag.physical_exams.all()
                ]
                if physical_exams:
                    await DiagnosisPhysicalExam.bulk_create(physical_exams)

                laboratory_tests = [
                    DiagnosisLaboratoryTest(diagnosis=new_diag, test=test.test)
                    for test in await diag.laboratory_tests.all()
                ]
                if laboratory_tests:
                    await DiagnosisLaboratoryTest.bulk_create(laboratory_tests)

                teachings = [
                    DiagnosisTeaching(diagnosis=new_diag, topic=teaching.topic)
                    for teaching in await diag.teachings.all()
                ]
                if teachings:
                    await DiagnosisTeaching.bulk_create(teachings)

                current_medications = [
                    DiagnosisCurrentMedication(diagnosis=new_diag, med=med.med)
                    for med in await diag.current_medications.all()
                ]
                if current_medications:
                    await DiagnosisCurrentMedication.bulk_create(current_medications)

                prescribed_medications = [
                    DiagnosisPrescribedMedication(diagnosis=new_diag, med=med.med)
                    for med in await diag.prescribed_medications.all()
                ]
                if prescribed_medications:
                    await DiagnosisPrescribedMedication.bulk_create(prescribed_medications)

            logger.info(f"Copied {len(template_diagnoses)} diagnoses to new user {user.id}")
        except Exception as e:
            logger.error(f"Error copying diagnoses to new user {user.id}: {e}")
            raise

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        logger.info(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        logger.info(f"Verification requested for user {user.id}. Verification token: {token}")

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

async def get_user_from_token(request: Request) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    try:
        payload = decode_jwt(token, SECRET)
        user_id = payload.get("sub")
        if user_id:
            return await User.get_or_none(id=user_id)
    except Exception as e:
        logger.warning(f"Failed to decode JWT for logging: {e}")
    return None