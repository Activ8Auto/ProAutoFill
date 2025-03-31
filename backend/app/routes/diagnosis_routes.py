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

router = APIRouter()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@router.get("/diagnoses", response_model=list[DiagnosisSchema])
async def get_diagnoses():
    logger.debug("Fetching diagnoses...")
    try:
        diagnoses = await DiagnosisEntry.all().prefetch_related(
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
@router.delete("/diagnoses/{diagnosis_id}", status_code=200)
async def delete_diagnosis(diagnosis_id: str):
    """
    Delete a diagnosis entry by its ID.

    Args:
        diagnosis_id (str): The UUID of the diagnosis to delete.

    Returns:
        dict: A success message.

    Raises:
        HTTPException: 404 if the diagnosis is not found.
    """
    logger.debug(f"Attempting to delete diagnosis with ID: {diagnosis_id}")
    try:
        diagnosis = await DiagnosisEntry.get(id=diagnosis_id)
        await diagnosis.delete()
        logger.debug(f"Successfully deleted diagnosis with ID: {diagnosis_id}")
        return {"message": f"Diagnosis {diagnosis_id} deleted successfully"}
    except DoesNotExist:
        logger.error(f"Diagnosis with ID {diagnosis_id} not found")
        raise HTTPException(status_code=404, detail=f"Diagnosis with ID {diagnosis_id} not found")
    except Exception as e:
        logger.error(f"Error deleting diagnosis {diagnosis_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while deleting diagnosis")
    
    
@router.post("/diagnoses", response_model=DiagnosisSchema)
async def create_diagnosis(diagnosis: DiagnosisCreate):
    logger.debug(f"Received diagnosis data: {diagnosis.dict()}")
    try:
        await User.get(id=diagnosis.user_id)
    except DoesNotExist:
        logger.error(f"User {diagnosis.user_id} not found")
        raise HTTPException(status_code=400, detail=f"User with id {diagnosis.user_id} does not exist")

    new_id = uuid4()
    diagnosis_obj = await DiagnosisEntry.create(
        id=new_id,
        name=diagnosis.name,
        icd_code=diagnosis.icd_code,
        exclusion_group=diagnosis.exclusion_group,
        user_id=diagnosis.user_id
    )
    logger.debug(f"Created DiagnosisEntry: {diagnosis_obj.id}")

    # Create associated lists
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

    # Fetch the object with related data
    fetched_obj = await DiagnosisEntry.get(id=diagnosis_obj.id).prefetch_related(
        "physical_exams",
        "laboratory_tests",
        "teachings",
        "current_medications",
        "prescribed_medications"
    )

    # Transform the data to match DiagnosisSchema
    response_data = {
        "id": str(fetched_obj.id),  # Convert UUID to str
        "user_id": str(fetched_obj.user_id),  # Convert UUID to str
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