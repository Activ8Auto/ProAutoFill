import asyncio
import os
import logging
import random
from datetime import datetime
from tortoise import Tortoise
from celery import shared_task
from app.db.db import TORTOISE_ORM
from app.automation_runner import run_automation, UserFixableError, cancel_automation
from app.celery.celery_worker import celery_app
from app.models.models import AutomationProfile, User, AutomationRun
from fastapi import HTTPException
CELERY_TORTOISE_ORM = {
    "connections": {
        "default": "postgres://AutoFill_owner:npg_6ukJS5TFVLho@ep-fancy-morning-a62bwuep-pooler.us-west-2.aws.neon.tech/AutoFill?ssl=true"
    },
    "apps": {
        "models": {
            "models": ["app.models.models"],
            "default_connection": "default",
        },
    },
}
logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def run_automation_task(self, profile_id, user_id):
    """
    Celery entry point. Creates an event loop and runs the automation job.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        asyncio.run(run_automation_job(profile_id, user_id))
    finally:
        loop.close()

async def run_automation_job(profile_id: str, user_id: str):
    """
    Runs the automation job, looping until target_minutes is reached.
    Each run is retried up to 3 times. Total minutes are preserved from successful runs,
    and the loop continues even if some runs fail.
    """
    # Initialize Tortoise ORM
    await Tortoise.init(config=CELERY_TORTOISE_ORM)
    
    # Fetch user and profile
    try:
        user = await User.get(id=user_id)
        profile = await AutomationProfile.get(id=profile_id).prefetch_related("diagnoses")
    except Exception as e:
        logger.error(f"Failed to fetch user or profile: {e}")
        raise HTTPException(status_code=404, detail="Profile or User not found")

    if str(profile.user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Convert hours to minutes
    target_minutes = profile.target_hours * 60

    # Build profile_data
    profile_data = {
        "selected_date": profile.selected_date.isoformat() if profile.selected_date else None,
        "runHeadless": profile.run_headless,
        "targetHours": profile.target_hours,
        "minWait": profile.min_wait,
        "maxWait": profile.max_wait,
        "maxDiagnoses": profile.max_diagnoses,
        "siteType": profile.site_type,
        "rotation": profile.rotation,
        "faculty": profile.faculty,
        "visitType": profile.visit_type,
        "age_ranges": profile.age_ranges,
        "gender": profile.gender,
        "race": profile.race,
        "siteLocation": profile.site_location,
        "cptCode": profile.cpt_code,
        "student_function_weights": profile.student_function_weights,
        "complexity": profile.complexity,
        "durationOptions": profile.duration_options,
        "durationWeights": profile.duration_weights,
        "preceptor": profile.preceptor,
        "chamberlainPassword": profile.chamberlain_password,
        "dNumber": profile.d_number,
        "diagnoses": {},
    }

    if user.profile_info:
        profile_data.update(user.profile_info)

    # Build diagnoses dict
    diagnoses_qs = await profile.diagnoses.all().prefetch_related(
        "current_medications", "physical_exams", "laboratory_tests",
        "teachings", "prescribed_medications",
    )
    diagnoses_dict = {
        diag.name: {
            "icd_code": diag.icd_code,
            "current_medications": [cm.med for cm in diag.current_medications] if diag.current_medications else [],
            "physical_exams": [pe.exam for pe in diag.physical_exams] if diag.physical_exams else [],
            "labs": [lab.test for lab in diag.laboratory_tests] if diag.laboratory_tests else [],
            "teaching": [t.topic for t in diag.teachings] if diag.teachings else [],
            "medications": [m.med for m in diag.prescribed_medications] if diag.prescribed_medications else [],
            "exclusion_group": diag.exclusion_group,
        }
        for diag in diagnoses_qs
    }
    profile_data["diagnoses"] = diagnoses_dict

    # Run until target_minutes is reached
    total_minutes_run = 0
    run_count = 0  # Track the number of run attempts

    while total_minutes_run < target_minutes:
        run_count += 1
        # Create an in-progress record
        new_run = await AutomationRun.create(
            user=user,
            profile=profile,
            start_time=datetime.utcnow(),
            status="in-progress",
            selected_date=profile.selected_date,
            run_headless=profile.run_headless,
            rotation=profile.rotation,
            faculty=profile.faculty,
            preceptor=profile.preceptor,
            site_type=profile.site_type,
            site_location=profile.site_location,
            cpt_code=profile.cpt_code,
        )

        success = False
        attempt_count = 0

        # Retry this run up to 3 times
        for attempt in range(3):
            attempt_count = attempt + 1
            try:
                final_picks = await run_automation(profile_data)
                
                # Determine session_minutes
                if "1 hour" in final_picks["random_duration"].lower():
                    session_minutes = 60
                elif "30 minute" in final_picks["random_duration"].lower():
                    session_minutes = 30
                else:
                    session_minutes = 30

                total_minutes_run += session_minutes
                logger.info(f"[DEBUG] Run {run_count}, Attempt {attempt_count} succeeded. Total minutes: {total_minutes_run}")
                
                # Mark success
                await new_run.update_from_dict({
                    "end_time": datetime.utcnow(),
                    "status": "success",
                    "attempt_count": attempt_count,
                    "selected_duration": final_picks["random_duration"],
                    "selected_visit_type": final_picks["random_visit_type"],
                    "selected_age_range": final_picks["random_age"],
                    "selected_gender": final_picks["random_gender"],
                    "selected_race": final_picks["random_race"],
                    "selected_student_function_level": final_picks["student_function"],
                    "selected_complexity": final_picks["complexity"],
                    "selected_diagnoses": final_picks["selected_diagnoses"],
                    "selected_current_medications": final_picks["all_medications"],
                    "selected_prescribed_medications": final_picks["all_prescribed_meds"],
                    "chosen_minutes": session_minutes,
                })
                await new_run.save()
                success = True
                break  # Exit retry loop on success

            except UserFixableError as e:
                logger.error(f"Run {run_count}, Attempt {attempt_count} failed with user-fixable error: {e}")
                await new_run.update_from_dict({
                    "end_time": datetime.utcnow(),
                    "status": "failed",
                    "details": {"error": str(e), "user_fixable": True},
                })
                await new_run.save()
                break  # Don’t retry user-fixable errors
            except Exception as e:
                logger.error(f"Run {run_count}, Attempt {attempt_count} failed: {e}")
                if attempt == 2:  # Last attempt
                    await new_run.update_from_dict({
                        "end_time": datetime.utcnow(),
                        "status": "failed",
                        "details": {"error": str(e), "user_fixable": False},
                    })
                    await new_run.save()
                else:
                    logger.info(f"Retrying run {run_count}...")

        # Clean up after each run attempt (successful or not)
        await cancel_automation()

        if not success:
            logger.warning(f"Run {run_count} failed after 3 attempts, continuing to next run.")

        # Ensure at least 3 runs, even if target_minutes is reached early
        if run_count < 3 and total_minutes_run >= target_minutes:
            logger.info(f"Target minutes reached ({total_minutes_run}/{target_minutes}), but enforcing minimum 3 runs.")
            continue

        # Wait before next run if more time is needed
        if total_minutes_run < target_minutes:
            wait_seconds = random.randint(45, 120)
            logger.info(f"Waiting {wait_seconds} seconds before next run.")
            await asyncio.sleep(wait_seconds)

    logger.info(f"Automation completed for user {user_id}, profile {profile_id}. Total minutes: {total_minutes_run}")
    await Tortoise.close_connections()