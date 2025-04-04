# backend/app/schemas/profile_schema.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import date
from uuid import UUID


from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
 # if needed, otherwise ConfigDict is available in pydantic>=2

class DiagnosisRef(BaseModel):
    id: UUID

class AutomationProfileSchema(BaseModel):
    user_id: Optional[UUID] = Field(None, alias="userId")
    target_hours: int = Field(..., alias="targetHours")
    selected_date: str = Field(..., alias="selectedDate")
    min_wait: int = Field(..., alias="minWait")
    max_wait: int = Field(..., alias="maxWait")
    run_headless: bool = Field(..., alias="runHeadless")
    max_diagnoses: int = Field(..., alias="maxDiagnoses")
    visit_type: str = Field(..., alias="visitType")
    site_type: str = Field(..., alias="siteType")
    cpt_code: str = Field(..., alias="cptCode")
    site_location: str = Field(..., alias="siteLocation")
    rotation: str
    faculty: str
    preceptor: str
    name: str
    age_ranges: Optional[List[dict]] = Field(default_factory=list, alias="age_ranges")
    gender: Optional[List[dict]] = Field(default_factory=list)
    race: Optional[List[dict]] = Field(default_factory=list)
    student_function_weights: List[dict] = Field(..., alias="studentFunctionWeights")
    complexity: Optional[List[dict]] = Field(default_factory=list)
    duration_options: List[str] = Field(..., alias="durationOptions")
    duration_weights: List[int] = Field(..., alias="durationWeights")
    diagnoses: Optional[List[DiagnosisRef]] = Field(default_factory=list)
    dNumber: Optional[str]
    chamberlainPassword: Optional[str]

    model_config = ConfigDict(
        populate_by_name=True,
        extra="allow"
    )
