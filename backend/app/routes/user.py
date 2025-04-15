from fastapi import APIRouter, HTTPException, Depends
from app.models.models import User
from pydantic import BaseModel
from typing import Optional, Dict, Any
from tortoise.exceptions import DoesNotExist
from fastapi_users import FastAPIUsers
from app.auth import current_active_user

class ProfileInfoUpdate(BaseModel):
    profile_info: Optional[Dict[str, Any]]

router = APIRouter(prefix="/users", tags=["Users"])

class UserDefaultsUpdate(BaseModel):
    default_values: Optional[Dict[str, Any]]


@router.patch("/{user_id}/defaults/")
async def update_user_defaults(
    user_id: str,
    defaults: UserDefaultsUpdate,
    current_user: User = Depends(current_active_user)  # Ensure user is authenticated
):
    # Optionally, you can verify that current_user.id matches user_id
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="You can only update your own defaults")

    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.default_values = defaults.default_values
    await user.save()
    return {"message": "User defaults updated successfully", "default_values": user.default_values}


@router.patch("/{user_id}/profile-info/")
async def update_profile_info(
    user_id: str,
    payload: ProfileInfoUpdate,
    current_user: User = Depends(current_active_user),
):
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.profile_info = payload.profile_info or {}
    await user.save()
    return {"message": "Profile info updated", "profile_info": user.profile_info}

@router.get("/{user_id}/profile-info/")
async def get_profile_info(user_id: str, current_user: User = Depends(current_active_user)):
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"profile_info": user.profile_info or {}}

@router.get("/{user_id}/defaults/")
async def get_user_defaults(user_id: str):
    if user_id in (None, "", "null"):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = await User.get(id=user_id).values("default_values")
    return user

