
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.auth import current_active_user
from app.models.models import AutomationProfile, User, AutomationRun
from app.automation_runner import run_automation
from app.celery.tasks import run_automation_task
from tortoise.exceptions import DoesNotExist

router = APIRouter()
logger = logging.getLogger(__name__)

class AutomationRunRequest(BaseModel):
    profile_id: str



@router.post("/run")
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


@router.get("/runs/remaining")
async def get_remaining_runs(current_user: User = Depends(current_active_user)):
    if current_user.is_paid_user:
        return {"is_paid_user": True, "remaining_runs": None}

    successful_runs = await AutomationRun.filter(user=current_user, status="success").count()
    remaining = max(0, 10 - successful_runs)

    return {
        "is_paid_user": False,
        "remaining_runs": remaining
    }

# @router.post("/run")
# async def trigger_run(
#     payload: AutomationRunRequest,
#     current_user: User = Depends(current_active_user)
# ):
#     # 1) Fetch the profile
#     try:
#         profile = await AutomationProfile.get(id=payload.profile_id).prefetch_related("diagnoses")
#     except DoesNotExist:
#         raise HTTPException(status_code=404, detail="Profile not found")

#     # Check permission
#     if str(profile.user_id) != str(current_user.id):
#         raise HTTPException(status_code=403, detail="Not authorized")

#     # Convert hours to minutes
#     target_minutes = profile.target_hours * 60

#     # Pre-load your `profile_data` dict (like you do now)
#     # for each run_automation_once call
#     profile_data = { 
#        # same as you have now...
#        "selected_date": profile.selected_date.isoformat() if profile.selected_date else None,
#        "runHeadless": profile.run_headless,
#        "targetHours": profile.target_hours,
#        "minWait": profile.min_wait,
#        "maxWait": profile.max_wait,
#        "maxDiagnoses": profile.max_diagnoses,
#        "siteType": profile.site_type,
#        "rotation": profile.rotation,
#        "faculty": profile.faculty,
#        "visitType": profile.visit_type,
#        "age_ranges": profile.age_ranges,
#        "gender": profile.gender,
#        "race": profile.race,
#        "siteLocation": profile.site_location,
#        "cptCode": profile.cpt_code,
#        "student_function_weights": profile.student_function_weights,
#        "complexity": profile.complexity,
#        "durationOptions": profile.duration_options,
#        "durationWeights": profile.duration_weights,
#        "preceptor": profile.preceptor,
#        "chamberlainPassword": profile.chamberlain_password,
#        "dNumber": profile.d_number,
#        "diagnoses": {},  # you'll fill this in with your diagnoses dict
#        # plus user.profile_info if needed
#     }

#     # Build your diagnoses dict
#     diagnoses_qs = await profile.diagnoses.all().prefetch_related(
#         "current_medications", "physical_exams", "laboratory_tests",
#         "teachings", "prescribed_medications",
#     )
#     diagnoses_dict = {
#     diag.name: {
#         "icd_code": diag.icd_code,
#         "current_medications": [cm.med for cm in diag.current_medications] if diag.current_medications else [],
#         "physical_exams": [pe.exam for pe in diag.physical_exams] if diag.physical_exams else [],
#         "labs": [lab.test for lab in diag.laboratory_tests] if diag.laboratory_tests else [],
#         "teaching": [t.topic for t in diag.teachings] if diag.teachings else [],
#         "medications": [m.med for m in diag.prescribed_medications] if diag.prescribed_medications else [],
#         "exclusion_group": diag.exclusion_group,
#     }
#     for diag in diagnoses_qs
# }     # same logic you already do
#     profile_data["diagnoses"] = diagnoses_dict

#     if current_user.profile_info:
#         profile_data.update(current_user.profile_info)

#     total_minutes_run = 0
#     runs_data = []  # to collect info about each run if you want to return it

#     while total_minutes_run < target_minutes:
#         # 2) Create an "in-progress" record
#         new_run = await AutomationRun.create(
#             user=current_user,
#             profile=profile,
#             start_time=datetime.utcnow(),
#             status="in-progress",
#             # Any static fields from the profile if you want to store them
#             selected_date=profile.selected_date,
#             run_headless=profile.run_headless,
#             rotation=profile.rotation,
#             faculty=profile.faculty,
#             preceptor=profile.preceptor,
#             site_type=profile.site_type,
#             site_location=profile.site_location,
#             cpt_code=profile.cpt_code,
#         )

#         try:
#             # 3) Actually run once
#             final_picks = await run_automation(profile_data)

#             # 4) Figure out how many minutes were chosen (30 or 60, etc.)
#             if "1 hour" in final_picks["random_duration"].lower():
#                 session_minutes = 60
#             elif "30 minute" in final_picks["random_duration"].lower():
#                 session_minutes = 30
#             else:
#                 # default fallback, or parse from string, etc.
#                 session_minutes = 30

#             total_minutes_run += session_minutes
#             logger.info(f"\033[93m[DEBUG] Total minutes so far: {total_minutes_run}\033[0m")
#             # 5) Update the DB record with success info
#             await new_run.update_from_dict({
#                 "end_time": datetime.utcnow(),
#                 "status": "success",
#                 "attempt_count": 1,  # or whatever if you track attempts
#                 "selected_duration": final_picks["random_duration"],
#                 "selected_visit_type": final_picks["random_visit_type"],
#                 "selected_age_range": final_picks["random_age"],
#                 "selected_gender": final_picks["random_gender"],
#                 "selected_race": final_picks["random_race"],
#                 "selected_student_function_level": final_picks["student_function"],
#                 "selected_complexity": final_picks["complexity"],
#                 "selected_diagnoses": final_picks["selected_diagnoses"],
#                 "selected_current_medications": final_picks["all_medications"],
#                 "selected_prescribed_medications": final_picks["all_prescribed_meds"],
#                 "chosen_minutes": session_minutes, 
#             })
#             await new_run.save()

#             # Optionally, store run info in a list to return at the end
#             runs_data.append({
#                 "run_id": str(new_run.id),
#                 "minutes": session_minutes,
#                 "final_picks": final_picks,
#                 "total_minutes_so_far": total_minutes_run
#             })

#         except Exception as e:
#             # 6) Mark run as failed
#             await new_run.update_from_dict({
#                 "end_time": datetime.utcnow(),
#                 "status": "failed",
#                 "details": {"error": str(e)},
#             })
#             await new_run.save()

#             raise HTTPException(status_code=500, detail=f"Automation run failed: {e}")

#         # if we haven't reached the target, loop again

#     # Once we exit the loop, we've met or exceeded target_minutes
#     return {
#         "message": "✅ Automation completed all runs successfully",
#         "total_minutes_run": total_minutes_run,
#         "runs": runs_data
#     }



