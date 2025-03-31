# backend/app/models/models.py
from tortoise import fields, models

class User(models.Model):
    id = fields.UUIDField(pk=True)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    is_paid_user = fields.BooleanField(default=False)
    
    # New JSON field for storing default settings
    default_values = fields.JSONField(null=True)

    profiles: fields.ReverseRelation["AutomationProfile"]

    class Meta:
        table = "users"


class AutomationProfile(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="profiles")
    name = fields.CharField(max_length=255)
    target_hours = fields.IntField()
    selected_date = fields.DateField(null=True)
    min_wait = fields.IntField()
    max_wait = fields.IntField()
    run_headless = fields.BooleanField(default=True)
    max_diagnoses = fields.IntField(default=0)
    rotation = fields.CharField(max_length=255, null=True)
    faculty = fields.CharField(max_length=255, null=True)
    visit_type = fields.CharField(max_length=255, null=True)
    site_type = fields.CharField(max_length=255, null=True)
    cpt_code = fields.CharField(max_length=255, null=True)
    preceptor = fields.CharField(max_length=255)

    # JSON fields
    age_ranges = fields.JSONField(null=True)
    student_function_weights = fields.JSONField(null=True)
    duration_weights = fields.JSONField(null=True)
    duration_options = fields.JSONField(null=True)
   

    # Additional fields from the frontend:
    site_location = fields.CharField(max_length=255, null=True)
    gender = fields.JSONField(null=True)
    race = fields.JSONField(null=True)
    complexity = fields.JSONField(null=True)

    # Many-to-many relationship to diagnoses (using an explicit through model)
    diagnoses = fields.ManyToManyField(
    "models.DiagnosisEntry",
    related_name="profiles",
    through="automationprofile_diagnosisentry",  # optional custom name
)

    class Meta:
        table = "automation_profiles"


class DiagnosisEntry(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="diagnoses")
    name = fields.CharField(max_length=255)
    icd_code = fields.CharField(max_length=50, null=True)
    exclusion_group = fields.CharField(max_length=255, null=True)

    # Reverse relations for detail tables:
    physical_exams: fields.ReverseRelation["DiagnosisPhysicalExam"]
    laboratory_tests: fields.ReverseRelation["DiagnosisLaboratoryTest"]
    teachings: fields.ReverseRelation["DiagnosisTeaching"]
    current_medications: fields.ReverseRelation["DiagnosisCurrentMedication"]
    prescribed_medications: fields.ReverseRelation["DiagnosisPrescribedMedication"]
    profiles: fields.ManyToManyRelation["AutomationProfile"]

    class Meta:
        table = "diagnosis_entries"

class DiagnosisLaboratoryTest(models.Model):
    id = fields.IntField(pk=True)
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="laboratory_tests")
    test = fields.CharField(max_length=255)

    class Meta:
        table = "diagnosis_laboratory_tests"


class DiagnosisTeaching(models.Model):
    id = fields.IntField(pk=True)
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="teachings")
    topic = fields.CharField(max_length=255)

    class Meta:
        table = "diagnosis_teaching"


class DiagnosisCurrentMedication(models.Model):
    id = fields.IntField(pk=True)
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="current_medications")
    med = fields.CharField(max_length=255)

    class Meta:
        table = "diagnosis_current_medications"


class DiagnosisPrescribedMedication(models.Model):
    id = fields.IntField(pk=True)
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="prescribed_medications")
    med = fields.CharField(max_length=255)

    class Meta:
        table = "diagnosis_prescribed_medications"

# Example of a detail model (repeat similarly for others)
class DiagnosisPhysicalExam(models.Model):
    id = fields.IntField(pk=True)
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="physical_exams")
    exam = fields.CharField(max_length=255)

    class Meta:
        table = "diagnosis_physical_exam"


# Through table for Automation Profiles <-> Diagnoses
class ProfileDiagnoses(models.Model):
    id = fields.IntField(pk=True)
    profile = fields.ForeignKeyField("models.AutomationProfile", related_name="profile_diagnoses")
    diagnosis = fields.ForeignKeyField("models.DiagnosisEntry", related_name="profile_diagnoses")

    class Meta:
        table = "profile_diagnoses"
