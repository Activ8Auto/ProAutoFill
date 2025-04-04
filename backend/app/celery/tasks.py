import asyncio
import os
import logging
import random  # Import random for wait time calculation
from datetime import datetime
from tortoise import Tortoise
from celery import shared_task
from app.db.db import TORTOISE_ORM
from app.automation_runner import run_automation, UserFixableError
from app.celery.celery_worker import celery_app
from app.models.models import AutomationProfile, User, AutomationRun
from app.automation_runner import run_automation, cancel_automation
from fastapi import HTTPException

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def run_automation_task(self, profile_id, user_id):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        asyncio.run(run_automation_job(profile_id, user_id))
    finally:
        loop.close()

async def run_automation_job(profile_id: str, user_id: str):
    # 1) Initialize Tortoise so we can do DB queries
    await Tortoise.init(
        config={
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
    )
    
    # 2) Fetch user + profile
    try:
        user = await User.get(id=user_id)
        profile = await AutomationProfile.get(id=profile_id).prefetch_related("diagnoses")
    except:
        raise HTTPException(status_code=404, detail="Profile or User not found")

    if str(profile.user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3) Convert hours to minutes
    target_minutes = profile.target_hours * 60

    # 4) Build profile_data
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
       "diagnoses": {},  # we fill this next
    }

    # Merge user.profile_info if you want
    if user.profile_info:
        profile_data.update(user.profile_info)

    # 5) Build diagnoses dict
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

    # 6) Run multiple times until we hit target_minutes
    total_minutes_run = 0
    while total_minutes_run < target_minutes:
        # Create an in-progress run
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

        try:
            # Actually do 1 automation run with Playwright
            final_picks = await run_automation(profile_data)
        
            # Determine session minutes
            if "1 hour" in final_picks["random_duration"].lower():
                session_minutes = 60
            elif "30 minute" in final_picks["random_duration"].lower():
                session_minutes = 30
            else:
                session_minutes = 30
        
            total_minutes_run += session_minutes
            logger.info(f"\033[93m[DEBUG] Total minutes so far: {total_minutes_run}\033[0m")
        
            # Mark success
            await new_run.update_from_dict({
                "end_time": datetime.utcnow(),
                "status": "success",
                "attempt_count": 1,
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
        
        except UserFixableError as e:
            # Handle user-fixable errors
            await new_run.update_from_dict({
                "end_time": datetime.utcnow(),
                "status": "failed",
                "details": {"error": str(e), "user_fixable": True},
            })
            await new_run.save()
            raise  # Stop the loop to let the user fix the issue
        
        except Exception as e:
            # Handle system errors
            await new_run.update_from_dict({
                "end_time": datetime.utcnow(),
                "status": "failed",
                "details": {"error": str(e), "user_fixable": False},
            })
            await new_run.save()
            raise  # Stop the loop or implement retry logic (see step 6)
        finally:
            await cancel_automation()  # Clean up browser and Playwright
            await Tortoise.close_connections()
        

        # Wait a random time between 45 and 120 seconds before starting the next iteration,
        # but only if there is more work to do.
        if total_minutes_run < target_minutes:
            wait_seconds = random.randint(45, 120)
            logger.info(f"Waiting {wait_seconds} seconds before next iteration.")
            await asyncio.sleep(wait_seconds)

    logger.info(f"Automation completed all runs successfully for user {user_id}, profile {profile_id}")
    # Optionally close Tortoise
    await Tortoise.close_connections()
