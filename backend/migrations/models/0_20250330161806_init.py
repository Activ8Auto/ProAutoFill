from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_paid_user" BOOL NOT NULL DEFAULT False,
    "default_values" JSONB
);
CREATE TABLE IF NOT EXISTS "automation_profiles" (
    "id" UUID NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "target_hours" INT NOT NULL,
    "selected_date" DATE,
    "min_wait" INT NOT NULL,
    "max_wait" INT NOT NULL,
    "run_headless" BOOL NOT NULL DEFAULT True,
    "max_diagnoses" INT NOT NULL DEFAULT 0,
    "rotation" VARCHAR(255),
    "faculty" VARCHAR(255),
    "visit_type" VARCHAR(255),
    "site_type" VARCHAR(255),
    "cpt_code" VARCHAR(255),
    "age_ranges" JSONB,
    "student_function_weights" JSONB,
    "duration_weights" JSONB,
    "duration_options" JSONB,
    "site_location" VARCHAR(255),
    "gender" JSONB,
    "race" JSONB,
    "complexity" JSONB,
    "user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_entries" (
    "id" UUID NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "icd_code" VARCHAR(50),
    "exclusion_group" VARCHAR(255),
    "user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_current_medications" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "med" VARCHAR(255) NOT NULL,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_laboratory_tests" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "test" VARCHAR(255) NOT NULL,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_physical_exam" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "exam" VARCHAR(255) NOT NULL,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_prescribed_medications" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "med" VARCHAR(255) NOT NULL,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "diagnosis_teaching" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "topic" VARCHAR(255) NOT NULL,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "profile_diagnoses" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "diagnosis_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE,
    "profile_id" UUID NOT NULL REFERENCES "automation_profiles" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS "automationprofile_diagnosisentry" (
    "automation_profiles_id" UUID NOT NULL REFERENCES "automation_profiles" ("id") ON DELETE CASCADE,
    "diagnosisentry_id" UUID NOT NULL REFERENCES "diagnosis_entries" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_automationp_automat_e95047" ON "automationprofile_diagnosisentry" ("automation_profiles_id", "diagnosisentry_id");"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
