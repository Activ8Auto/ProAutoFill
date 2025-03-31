from fastapi import APIRouter, HTTPException
from app.models.models import User
from pydantic import BaseModel
from typing import Optional, Dict, Any
from tortoise.exceptions import DoesNotExist

router = APIRouter(prefix="/users", tags=["Users"])

class UserDefaultsUpdate(BaseModel):
    default_values: Optional[Dict[str, Any]]

@router.patch("/{user_id}/defaults")
async def update_user_defaults(user_id: str, defaults: UserDefaultsUpdate):
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.default_values = defaults.default_values
    await user.save()
    return {"message": "User defaults updated successfully", "default_values": user.default_values}

@router.get("/{user_id}/defaults")
async def get_user_defaults(user_id: str):
    user = await User.get(id=user_id).values("default_values")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"default_values": user["default_values"] or {}}
