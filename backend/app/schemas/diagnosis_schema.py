from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class DiagnosisCreate(BaseModel):
    user_id: str
    name: str
    icd_code: str
    current_medications: List[str]
    physical_exam: List[str]
    laboratory_tests: List[str]
    teaching_provided: List[str]
    medications: List[str]
    exclusion_group: Optional[str]

    class Config:
        from_attributes = True

class DiagnosisSchema(BaseModel):
    id: str  # Still str, we'll convert UUID to str in the endpoint
    user_id: str  # Still str, we'll convert UUID to str
    name: str
    icd_code: str
    current_medications: Optional[List[str]] = []  # Optional with default empty list
    physical_exam: Optional[List[str]] = []  # Match frontend expectation
    laboratory_tests: Optional[List[str]] = []  # Optional
    teachings: Optional[List[str]] = []  # Match model relation name
    prescribed_medications: Optional[List[str]] = []  # Match model relation name
    exclusion_group: Optional[str] = None

    class Config:
        from_attributes = True
        # Handle Tortoise ORM objects and field name mismatches
        json_encoders = {
            UUID: str  # Convert UUID to string automatically
        }