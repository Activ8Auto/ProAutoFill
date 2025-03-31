# backend/app/routes/profiles.py
from fastapi import APIRouter, HTTPException, Request
from tortoise.exceptions import DoesNotExist
from app.models.models import AutomationProfile
from app.schemas.profile_schema import AutomationProfileSchema
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.models.models import DiagnosisEntry
from fastapi.logger import logger

import logging

logging.basicConfig(level=logging.DEBUG)

router = APIRouter()


@router.get("/", response_model=List[AutomationProfileSchema])
async def get_all_profiles():
    profiles = await AutomationProfile.all()
    return profiles


@router.get("/{profile_id}", response_model=AutomationProfileSchema)
async def get_profile(profile_id: str):
    try:
        profile = await AutomationProfile.get(id=profile_id)
        return profile
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")


@router.post("/", response_model=AutomationProfileSchema)
async def create_profile(request: Request):
    try:
        logger.info("📥 Received POST to /profiles")

        raw_body = await request.body()
        logger.info(f"📦 Raw request body: {raw_body.decode('utf-8')}")

        json_body = await request.json()
        logger.info(f"✅ Parsed JSON: {json_body}")

        profile = AutomationProfileSchema(**json_body)
        logger.info("✅ Successfully validated AutomationProfileSchema")
        logger.info(f"🧠 Profile fields: {profile.dict(exclude_unset=True)}")

        diagnoses_data = profile.diagnoses or []

        # ❗ Drop incoming 'id' to avoid primary key conflict
        profile_data = profile.dict(exclude={"diagnoses", "id"}, exclude_unset=True)

        new_profile = await AutomationProfile.create(**profile_data)

        for diag in diagnoses_data:
            await new_profile.diagnoses.add(await DiagnosisEntry.get(id=diag.id))

        await new_profile.fetch_related("diagnoses")

        response_data = {
            **profile_data,
            "id": new_profile.id,
            "selected_date": str(new_profile.selected_date),
            "preceptor": new_profile.preceptor,
            "userId": str(new_profile.user_id),
            "diagnoses": [{"id": d.id} for d in new_profile.diagnoses],
        }

        logger.info(f"🎉 Created profile with ID: {new_profile.id}")
        return response_data

    except Exception as e:
        logger.exception("🔥 Failed to create profile")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.put("/{profile_id}", response_model=AutomationProfileSchema)
async def update_profile(profile_id: str, updated_data: AutomationProfileSchema):
    try:
        profile = await AutomationProfile.get(id=profile_id).prefetch_related("diagnoses")
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Separate out diagnoses
    update_dict = updated_data.dict(exclude_unset=True, exclude={"diagnoses"})
    for key, value in update_dict.items():
        setattr(profile, key, value)
    await profile.save()

    # Handle diagnoses update
    if updated_data.diagnoses is not None:
        # Clear existing diagnoses
        await profile.diagnoses.clear()
        # Re-add current diagnoses
        for diag in updated_data.diagnoses:
            await profile.diagnoses.add(await DiagnosisEntry.get(id=diag.id))

    # Return with related diagnoses
    return await AutomationProfile.get(id=profile.id).prefetch_related("diagnoses")


@router.delete("/{profile_id}")
async def delete_profile(profile_id: str):
    deleted_count = await AutomationProfile.filter(id=profile_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"detail": "Profile deleted"}

class DefaultsUpdate(BaseModel):
    default_values: Optional[Dict[str, Any]]

@router.patch("/{profile_id}/defaults")
async def update_profile_defaults(profile_id: str, defaults: DefaultsUpdate):
    logging.debug(f"PATCH request received for profile_id: {profile_id}")
    logging.debug(f"Request body: {defaults}")
    
    profile = await AutomationProfile.get_or_none(id=profile_id)
    if not profile:
        logging.error(f"Profile with id {profile_id} not found")
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile.default_values = defaults.default_values
    await profile.save()
    logging.debug(f"Profile {profile_id} updated with defaults: {profile.default_values}")
    return {"message": "Defaults updated successfully", "default_values": profile.default_values}