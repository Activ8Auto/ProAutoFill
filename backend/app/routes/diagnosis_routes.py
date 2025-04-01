from fastapi import APIRouter, Depends, HTTPException
from tortoise.exceptions import DoesNotExist
from app.models.models import (
    DiagnosisEntry,
    DiagnosisPhysicalExam,
    DiagnosisLaboratoryTest,
    DiagnosisTeaching,
    DiagnosisCurrentMedication,
    DiagnosisPrescribedMedication,
    User,
)
from app.schemas.diagnosis_schema import DiagnosisSchema, DiagnosisCreate
from uuid import uuid4
import logging
from app.auth import current_active_user

router = APIRouter()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Updated GET endpoint
@router.get("/diagnoses", response_model=list[DiagnosisSchema])
async def get_diagnoses(current_user: User = Depends(current_active_user)):
    logger.debug("Fetching diagnoses for user: {current_user.id}")
    try:
        # Filter diagnoses by the authenticated user's ID
        diagnoses = await DiagnosisEntry.filter(user_id=current_user.id).prefetch_related(
            "physical_exams",
            "laboratory_tests",
            "teachings",
            "current_medications",
            "prescribed_medications"
        )
        logger.debug(f"Found diagnoses: {diagnoses}")
        # Transform Tortoise objects to match DiagnosisSchema
        return [
            {
                "id": str(diagnosis.id),
                "user_id": str(diagnosis.user_id),
                "name": diagnosis.name,
                "icd_code": diagnosis.icd_code,
                "current_medications": [med.med for med in diagnosis.current_medications],
                "physical_exam": [exam.exam for exam in diagnosis.physical_exams],
                "laboratory_tests": [test.test for test in diagnosis.laboratory_tests],
                "teachings": [teaching.topic for teaching in diagnosis.teachings],
                "prescribed_medications": [med.med for med in diagnosis.prescribed_medications],
                "exclusion_group": diagnosis.exclusion_group,
            }
            for diagnosis in diagnoses
        ]
    except Exception as e:
        logger.error(f"Error in get_diagnoses: {e}")
        raise e

# Updated DELETE endpoint
@router.delete("/diagnoses/{diagnosis_id}", status_code=200)
async def delete_diagnosis(
    diagnosis_id: str,
    current_user: User = Depends(current_active_user),
):
    logger.debug(f"Attempting to delete diagnosis with ID: {diagnosis_id} for user: {current_user.id}")
    try:
        # Restrict the query so that only a diagnosis belonging to the current user is returned.
        diagnosis = await DiagnosisEntry.get(id=diagnosis_id, user_id=current_user.id)
        await diagnosis.delete()
        logger.debug(f"Successfully deleted diagnosis with ID: {diagnosis_id}")
        return {"message": f"Diagnosis {diagnosis_id} deleted successfully"}
    except DoesNotExist:
        logger.error(f"Diagnosis with ID {diagnosis_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=404,
            detail=f"Diagnosis with ID {diagnosis_id} not found"
        )
    except Exception as e:
        logger.error(f"Error deleting diagnosis {diagnosis_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while deleting diagnosis"
        )
    
@router.post("/diagnoses", response_model=DiagnosisSchema)
async def create_diagnosis(
    diagnosis: DiagnosisCreate,
    current_user: User = Depends(current_active_user),
):
    logger.debug(f"Received diagnosis data (user: {current_user.id}): {diagnosis.dict()}")

    new_id = uuid4()

    diagnosis_obj = await DiagnosisEntry.create(
        id=new_id,
        name=diagnosis.name,
        icd_code=diagnosis.icd_code,
        exclusion_group=diagnosis.exclusion_group,
        user_id=current_user.id
    )
    logger.debug(f"Created DiagnosisEntry: {diagnosis_obj.id}")

    if diagnosis.physical_exam:
        await DiagnosisPhysicalExam.bulk_create([
            DiagnosisPhysicalExam(diagnosis=diagnosis_obj, exam=exam)
            for exam in diagnosis.physical_exam
        ])
        logger.debug("Physical exams created")

    if diagnosis.laboratory_tests:
        await DiagnosisLaboratoryTest.bulk_create([
            DiagnosisLaboratoryTest(diagnosis=diagnosis_obj, test=test)
            for test in diagnosis.laboratory_tests
        ])
        logger.debug("Laboratory tests created")

    if diagnosis.teaching_provided:
        await DiagnosisTeaching.bulk_create([
            DiagnosisTeaching(diagnosis=diagnosis_obj, topic=topic)
            for topic in diagnosis.teaching_provided
        ])
        logger.debug("Teachings created")

    if diagnosis.current_medications:
        await DiagnosisCurrentMedication.bulk_create([
            DiagnosisCurrentMedication(diagnosis=diagnosis_obj, med=med)
            for med in diagnosis.current_medications
        ])
        logger.debug("Current medications created")

    if diagnosis.medications:
        await DiagnosisPrescribedMedication.bulk_create([
            DiagnosisPrescribedMedication(diagnosis=diagnosis_obj, med=med)
            for med in diagnosis.medications
        ])
        logger.debug("Prescribed medications created")

    fetched_obj = await DiagnosisEntry.get(id=diagnosis_obj.id).prefetch_related(
        "physical_exams",
        "laboratory_tests",
        "teachings",
        "current_medications",
        "prescribed_medications"
    )

    response_data = {
        "id": str(fetched_obj.id),
        "user_id": str(fetched_obj.user_id),
        "name": fetched_obj.name,
        "icd_code": fetched_obj.icd_code,
        "current_medications": [med.med for med in fetched_obj.current_medications],
        "physical_exam": [exam.exam for exam in fetched_obj.physical_exams],
        "laboratory_tests": [test.test for test in fetched_obj.laboratory_tests],
        "teachings": [teaching.topic for teaching in fetched_obj.teachings],
        "prescribed_medications": [med.med for med in fetched_obj.prescribed_medications],
        "exclusion_group": fetched_obj.exclusion_group,
    }

    return DiagnosisSchema(**response_data)
