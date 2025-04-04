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
from app.schemas.diagnosis_schema import DiagnosisSchema, DiagnosisCreate, DiagnosisUpdate
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

# New PATCH endpoint for updating a diagnosis
@router.patch("/diagnoses/{diagnosis_id}", response_model=DiagnosisSchema)
async def update_diagnosis(
    diagnosis_id: str,
    diagnosis_update: DiagnosisUpdate,
    current_user: User = Depends(current_active_user),
):
    logger.debug(f"Updating diagnosis {diagnosis_id} for user {current_user.id} with data: {diagnosis_update.dict(exclude_unset=True)}")
    try:
        # Fetch the existing diagnosis, ensuring it belongs to the current user
        diagnosis = await DiagnosisEntry.get(id=diagnosis_id, user_id=current_user.id).prefetch_related(
            "physical_exams",
            "laboratory_tests",
            "teachings",
            "current_medications",
            "prescribed_medications"
        )

        # Update scalar fields if provided
        update_data = diagnosis_update.dict(exclude_unset=True, exclude={"physical_exam", "laboratory_tests", "teaching_provided", "current_medications", "medications"})
        if update_data:
            await diagnosis.update_from_dict(update_data)
            await diagnosis.save()

        # Update related fields (delete existing and recreate)
        if diagnosis_update.physical_exam is not None:
            await DiagnosisPhysicalExam.filter(diagnosis=diagnosis).delete()
            await DiagnosisPhysicalExam.bulk_create([
                DiagnosisPhysicalExam(diagnosis=diagnosis, exam=exam)
                for exam in diagnosis_update.physical_exam
            ])
            logger.debug("Physical exams updated")

        if diagnosis_update.laboratory_tests is not None:
            await DiagnosisLaboratoryTest.filter(diagnosis=diagnosis).delete()
            await DiagnosisLaboratoryTest.bulk_create([
                DiagnosisLaboratoryTest(diagnosis=diagnosis, test=test)
                for test in diagnosis_update.laboratory_tests
            ])
            logger.debug("Laboratory tests updated")

        if diagnosis_update.teaching_provided is not None:
            await DiagnosisTeaching.filter(diagnosis=diagnosis).delete()
            await DiagnosisTeaching.bulk_create([
                DiagnosisTeaching(diagnosis=diagnosis, topic=topic)
                for topic in diagnosis_update.teaching_provided
            ])
            logger.debug("Teachings updated")

        if diagnosis_update.current_medications is not None:
            await DiagnosisCurrentMedication.filter(diagnosis=diagnosis).delete()
            await DiagnosisCurrentMedication.bulk_create([
                DiagnosisCurrentMedication(diagnosis=diagnosis, med=med)
                for med in diagnosis_update.current_medications
            ])
            logger.debug("Current medications updated")

        if diagnosis_update.medications is not None:
            await DiagnosisPrescribedMedication.filter(diagnosis=diagnosis).delete()
            await DiagnosisPrescribedMedication.bulk_create([
                DiagnosisPrescribedMedication(diagnosis=diagnosis, med=med)
                for med in diagnosis_update.medications
            ])
            logger.debug("Prescribed medications updated")

        # Fetch updated object
        updated_diagnosis = await DiagnosisEntry.get(id=diagnosis_id).prefetch_related(
            "physical_exams",
            "laboratory_tests",
            "teachings",
            "current_medications",
            "prescribed_medications"
        )

        response_data = {
            "id": str(updated_diagnosis.id),
            "user_id": str(updated_diagnosis.user_id),
            "name": updated_diagnosis.name,
            "icd_code": updated_diagnosis.icd_code,
            "current_medications": [med.med for med in updated_diagnosis.current_medications],
            "physical_exam": [exam.exam for exam in updated_diagnosis.physical_exams],
            "laboratory_tests": [test.test for test in updated_diagnosis.laboratory_tests],
            "teachings": [teaching.topic for teaching in updated_diagnosis.teachings],
            "prescribed_medications": [med.med for med in updated_diagnosis.prescribed_medications],
            "exclusion_group": updated_diagnosis.exclusion_group,
        }

        return DiagnosisSchema(**response_data)

    except DoesNotExist:
        logger.error(f"Diagnosis with ID {diagnosis_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=404,
            detail=f"Diagnosis with ID {diagnosis_id} not found"
        )
    except Exception as e:
        logger.error(f"Error updating diagnosis {diagnosis_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while updating diagnosis"
        )
