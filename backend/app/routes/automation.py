
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.auth import current_active_user
from app.models.models import AutomationProfile, User, AutomationRun
from app.automation_runner import run_automation
from app.celery.tasks import run_automation_task
from tortoise.exceptions import DoesNotExist
from pprint import pformat

router = APIRouter()
logger = logging.getLogger(__name__)

class AutomationRunRequest(BaseModel):
    profile_id: str



@router.post("/run/")
async def trigger_run(
    payload: AutomationRunRequest,
    current_user: User = Depends(current_active_user)
):
    # 1) Quick permission check
    try:
        profile = await AutomationProfile.get(id=payload.profile_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")

    if str(profile.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # 💡 2) Enforce free-tier run limit
    if not current_user.is_paid_user:
        run_count = await AutomationRun.filter(user=current_user, status="success").count()
        if run_count >= 10:
            raise HTTPException(
                status_code=403,
                detail="Free-tier users are limited to 10 automation runs. Please upgrade your plan to continue."
            )

    # 💡 3) Schedule the Celery task
    result = run_automation_task.delay(str(profile.id), str(current_user.id))

    # 4) Return response
    return {
        "message": "Automation scheduled in background",
        "task_id": result.id
    }


@router.get("/runs/remaining/")
async def get_remaining_runs(current_user: User = Depends(current_active_user)):
    if current_user.is_paid_user:
        return {"is_paid_user": True, "remaining_runs": None}

    successful_runs = await AutomationRun.filter(user=current_user, status="success").count()
    remaining = max(0, 10 - successful_runs)

    return {
        "is_paid_user": False,
        "remaining_runs": remaining
    }
