# app/api/routes/runs.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from app.auth import current_active_user
from pydantic import BaseModel
from datetime import datetime
from app.models.models import AutomationRun, User
from tortoise.exceptions import DoesNotExist
from typing import List
from uuid import UUID

router = APIRouter()
logger = logging.getLogger(__name__)

class AutomationRunErrorResponse(BaseModel):
    id: UUID
    start_time: datetime
    end_time: datetime = None
    status: str
    details: dict = None

@router.get("/runs")
async def get_runs(current_user: User = Depends(current_active_user)):
    logger.info(f"Fetching automation runs for user id: {current_user.id}")
    try:
        runs = await AutomationRun.filter(user_id=current_user.id).order_by("-start_time").all()
        logger.info(f"Found {len(runs)} runs for user id: {current_user.id}")
        runs_data = [run.__dict__ for run in runs]
        logger.debug(f"Runs data: {runs_data}")
        return {"runs": runs_data}
    except DoesNotExist:
        logger.error(f"No runs found for user id: {current_user.id}")
        raise HTTPException(status_code=404, detail="No runs found for the user")
    except Exception as e:
        logger.exception("Unexpected error when fetching runs")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/runs/errors", response_model=List[AutomationRunErrorResponse])
async def get_error_logs(current_user: User = Depends(current_active_user)):
    error_runs = await AutomationRun.filter(user_id=current_user.id, status="failed").all()
    return error_runs

@router.delete("/runs/errors")
async def clear_error_logs(current_user: User = Depends(current_active_user)):
    """
    Delete all failed automation runs (error logs) for the current user.
    """
    try:
        logger.info(f"Clearing error logs for user id: {current_user.id}")
        deleted_count = await AutomationRun.filter(user_id=current_user.id, status="failed").delete()
        logger.info(f"Deleted {deleted_count} error logs for user id: {current_user.id}")
        return {"message": f"Successfully deleted {deleted_count} error logs"}
    except Exception as e:
        logger.exception(f"Error clearing error logs for user id: {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear error logs")