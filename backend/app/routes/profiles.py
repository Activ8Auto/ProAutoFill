from fastapi import APIRouter, HTTPException, Request, Depends
from tortoise.exceptions import DoesNotExist
from app.models.models import AutomationProfile, DiagnosisEntry, User
from app.schemas.profile_schema import AutomationProfileSchema
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.logger import logger
import logging
from datetime import date
from app.auth import current_active_user

logging.basicConfig(level=logging.DEBUG)

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    selected_date: Optional[date]
    chosen_minutes: Optional[int]

@router.get("/", response_model=List[AutomationProfileSchema])
async def get_all_profiles(current_user: User = Depends(current_active_user)):
    # Fetch profiles for the authenticated user with related diagnoses
    profiles = await AutomationProfile.filter(user_id=current_user.id).prefetch_related("diagnoses")
    
    # Fetch user's profile_info from the users table
    user = await User.get(id=current_user.id)
    profile_info = user.profile_info or {}  # Default to empty dict if null

    # Serialize the profiles manually to match the schema, merging profile_info
    serialized_profiles = []
    for profile in profiles:
        # Convert diagnoses relation to a list of IDs
        diagnoses_list = [{"id": diag.id} for diag in await profile.diagnoses.all()]
        
        # Build the serialized profile, overriding fields with profile_info where applicable
        serialized_profile = {
            "id": str(profile.id),
            "name": profile.name,
            "targetHours": profile.target_hours,
            "selected_date": profile.selected_date.isoformat(),  # Convert date to string
            "minWait": profile.min_wait,
            "maxWait": profile.max_wait,
            "runHeadless": profile.run_headless,
            "maxDiagnoses": profile.max_diagnoses,
            "siteType": profile.site_type,
            "rotation": profile_info.get("scheduledRotation", profile.rotation),  # Use profile_info.scheduledRotation if available
            "faculty": profile_info.get("faculty", profile.faculty),  # Use profile_info.faculty if available
            "visitType": profile.visit_type,
            "gender": profile.gender,
            "race": profile.race,
            "siteLocation": profile.site_location,
            "cptCode": profile.cpt_code,
            "student_function_weights": profile.student_function_weights,
            "complexity": profile.complexity,
            "durationOptions": profile.duration_options,
            "durationWeights": profile.duration_weights,
            "diagnoses": diagnoses_list,  # Use the resolved list
            "preceptor": profile_info.get("preceptor", profile.preceptor),  # Use profile_info.preceptor if available
            "userId": str(profile.user_id),
            "age_ranges": profile.age_ranges,
            "dNumber": profile_info.get("dNumber"),  # From profile_info
            "chamberlainPassword": profile_info.get("chamberlainPassword"),  # From profile_info
        }
        serialized_profiles.append(serialized_profile)
    
    return serialized_profiles

# Rest of your endpoints remain unchanged
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

        # Validate incoming data using Pydantic schema
        profile = AutomationProfileSchema(**json_body)
        logger.info("✅ Successfully validated AutomationProfileSchema")
        logger.info(f"🧠 Profile fields: {profile.model_dump(exclude_unset=True)}")

        # Fetch user's profile_info
        user = await User.get(id=current_user.id)
        profile_info = user.profile_info or {}  # Default to empty dict if null

        diagnoses_data = profile.diagnoses or []
        # Exclude 'diagnoses', 'id', and 'userId' from the payload
        profile_data = profile.model_dump(exclude={"diagnoses", "id", "userId"}, exclude_unset=True)
        
        # Merge profile_info into profile_data, overriding client-provided values
        profile_data["preceptor"] = profile_info.get("preceptor", profile_data.get("preceptor", ""))
        profile_data["faculty"] = profile_info.get("faculty", profile_data.get("faculty", ""))
        profile_data["rotation"] = profile_info.get("scheduledRotation", profile_data.get("rotation", ""))
        profile_data["dNumber"] = profile_info.get("dNumber")  # Optional field
        profile_data["chamberlainPassword"] = profile_info.get("chamberlainPassword")  # Optional field
        
        # Set the user field to the authenticated user
        profile_data["user"] = current_user

        # Create the new profile with merged data
        new_profile = await AutomationProfile.create(**profile_data)

        # Add many-to-many relationships for diagnoses, if any
        for diag in diagnoses_data:
            await new_profile.diagnoses.add(await DiagnosisEntry.get(id=diag.id))

        await new_profile.fetch_related("diagnoses")

        # Remove the "user" key from profile_data before building the response
        if "user" in profile_data:
            del profile_data["user"]

        # Build the response data
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

@router.patch("/{profile_id}/")
async def update_profile(
    profile_id: str,
    updates: ProfileUpdateRequest,
    current_user: User = Depends(current_active_user)
):
    logging.debug(f"PATCH /profiles/{profile_id}/ - Raw updates: {updates}")
    profile = await AutomationProfile.get_or_none(id=profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if str(profile.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await profile.save()
    return {"message": "Profile updated successfully", "updated_fields": update_data}