
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

@router.get("/jobs/")
async def get_automation_jobs(current_user: User = Depends(current_active_user)):
    """
    Fetch all automation jobs for the current user, grouped by job_id.
    Returns job details including total minutes, target minutes, status, and individual runs.
    """
    runs = await AutomationRun.filter(user=current_user).prefetch_related("profile")
    jobs = {}

    # Group runs by job_id
    for run in runs:
        job_id = run.job_id or "unknown"  # Fallback for runs before job_id was added
        if job_id not in jobs:
            jobs[job_id] = {
                "job_id": job_id,
                "profile_name": run.profile.name if run.profile else "Unknown",
                "target_minutes": run.profile.target_hours * 60 if run.profile else 0,
                "total_minutes": 0,
                "runs": []
            }
        if run.status == "success":
            jobs[job_id]["total_minutes"] += run.chosen_minutes
        jobs[job_id]["runs"].append({
            "id": str(run.id),
            "start_time": run.start_time.isoformat() if run.start_time else None,
            "end_time": run.end_time.isoformat() if run.end_time else None,
            "status": run.status,
            "chosen_minutes": run.chosen_minutes,
            "selected_duration": run.selected_duration,
            "selected_visit_type": run.selected_visit_type,
            "details": run.details
        })

    # Determine job status
    for job in jobs.values():
        if any(run["status"] == "in-progress" for run in job["runs"]):
            job["status"] = "Running"
        elif job["total_minutes"] >= job["target_minutes"]:
            job["status"] = "Completed"
        else:
            job["status"] = "Incomplete"

    return list(jobs.values())