from fastapi import APIRouter, HTTPException, Request, Depends
from tortoise.exceptions import DoesNotExist
from app.models.models import AutomationProfile, DiagnosisEntry, User
from app.schemas.profile_schema import AutomationProfileSchema  # Ensure this schema is adjusted as noted below
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.logger import logger
import logging
from app.auth import current_active_user

logging.basicConfig(level=logging.DEBUG)

router = APIRouter()

@router.get("/", response_model=List[AutomationProfileSchema])
async def get_all_profiles(current_user: User = Depends(current_active_user)):
    # Return only profiles that belong to the authenticated user:
    profiles = await AutomationProfile.filter(user_id=current_user.id)
    return profiles

@router.get("/{profile_id}", response_model=AutomationProfileSchema)
async def get_profile(profile_id: str, current_user: User = Depends(current_active_user)):
    try:
        profile = await AutomationProfile.get(id=profile_id)
        if str(profile.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to access this profile")
        return profile
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")

@router.post("/", response_model=AutomationProfileSchema)
async def create_profile(
    request: Request,
    current_user: User = Depends(current_active_user)
):
    try:
        logger.info("📥 Received POST to /profiles")
        raw_body = await request.body()
        logger.info(f"📦 Raw request body: {raw_body.decode('utf-8')}")
        json_body = await request.json()
        logger.info(f"✅ Parsed JSON: {json_body}")

        # Validate incoming data using your Pydantic schema.
        # The client does not supply a user identifier.
        profile = AutomationProfileSchema(**json_body)
        logger.info("✅ Successfully validated AutomationProfileSchema")
        logger.info(f"🧠 Profile fields: {profile.model_dump(exclude_unset=True)}")

        diagnoses_data = profile.diagnoses or []
        # Exclude 'diagnoses', 'id', and 'userId' from the payload.
        profile_data = profile.model_dump(exclude={"diagnoses", "id", "userId"}, exclude_unset=True)
        # Set the user field to the authenticated user for creation.
        profile_data["user"] = current_user

        new_profile = await AutomationProfile.create(**profile_data)

        # Add many-to-many relationships for diagnoses, if any.
        for diag in diagnoses_data:
            await new_profile.diagnoses.add(await DiagnosisEntry.get(id=diag.id))

        await new_profile.fetch_related("diagnoses")

        # Remove the "user" key from our profile_data before building the response.
        if "user" in profile_data:
            del profile_data["user"]

        # Build the response data.
        response_data = {
            **profile_data,
            "id": new_profile.id,
            "selected_date": str(new_profile.selected_date),
            "preceptor": new_profile.preceptor,
            "userId": str(new_profile.user_id),  # from the FK
            "diagnoses": [{"id": d.id} for d in new_profile.diagnoses],
        }

        logger.info(f"🎉 Created profile with ID: {new_profile.id}")
        return AutomationProfileSchema(**response_data)
    except Exception as e:
        logger.exception("🔥 Failed to create profile")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put("/{profile_id}", response_model=AutomationProfileSchema)
async def update_profile(
    profile_id: str,
    updated_data: AutomationProfileSchema,
    current_user: User = Depends(current_active_user)
):
    try:
        profile = await AutomationProfile.get(id=profile_id).prefetch_related("diagnoses")
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")

    if str(profile.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")

    # Exclude fields that should not be updated via the client.
    update_dict = updated_data.dict(exclude_unset=True, exclude={"diagnoses", "userId", "id"})
    for key, value in update_dict.items():
        setattr(profile, key, value)
    await profile.save()

    if updated_data.diagnoses is not None:
        await profile.diagnoses.clear()
        for diag in updated_data.diagnoses:
            await profile.diagnoses.add(await DiagnosisEntry.get(id=diag.id))

    return await AutomationProfile.get(id=profile.id).prefetch_related("diagnoses")

@router.delete("/{profile_id}")
async def delete_profile(
    profile_id: str,
    current_user: User = Depends(current_active_user)
):
    profile = await AutomationProfile.get_or_none(id=profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if str(profile.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this profile")
    deleted_count = await AutomationProfile.filter(id=profile_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"detail": "Profile deleted"}

class DefaultsUpdate(BaseModel):
    default_values: Optional[Dict[str, Any]]

@router.patch("/{profile_id}/defaults")
async def update_profile_defaults(
    profile_id: str,
    defaults: DefaultsUpdate,
    current_user: User = Depends(current_active_user)
):
    logging.debug(f"PATCH request received for profile_id: {profile_id}")
    logging.debug(f"Request body: {defaults}")
    
    profile = await AutomationProfile.get_or_none(id=profile_id)
    if not profile:
        logging.error(f"Profile with id {profile_id} not found")
        raise HTTPException(status_code=404, detail="Profile not found")
    if str(profile.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    profile.default_values = defaults.default_values
    await profile.save()
    logging.debug(f"Profile {profile_id} updated with defaults: {profile.default_values}")
    return {"message": "Defaults updated successfully", "default_values": profile.default_values}
