# app/api/routes/runs.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from app.auth import current_active_user
from app.models.models import AutomationRun, User
from tortoise.exceptions import DoesNotExist

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/runs")
async def get_runs(current_user: User = Depends(current_active_user)):
    logger.info(f"Fetching automation runs for user id: {current_user.id}")
    try:
        # Fetch all runs for the current user, ordered by most recent start time
        runs = await AutomationRun.filter(user_id=current_user.id).order_by("-start_time").all()
        logger.info(f"Found {len(runs)} runs for user id: {current_user.id}")

        # Optionally convert each model instance to a dictionary for serialization.
        runs_data = [run.__dict__ for run in runs]
        logger.debug(f"Runs data: {runs_data}")
        return {"runs": runs_data}
    except DoesNotExist:
        logger.error(f"No runs found for user id: {current_user.id}")
        raise HTTPException(status_code=404, detail="No runs found for the user")
    except Exception as e:
        logger.exception("Unexpected error when fetching runs")
        raise HTTPException(status_code=500, detail="Internal Server Error")
