-- Migration: Role separation and UUID implementation
-- This migration transforms the database from the old structure to the new role-based system with UUIDs

-- Step 1: Rename existing tables to preserve data during migration
ALTER TABLE "User" RENAME TO "users_old";
ALTER TABLE "Consultation" RENAME TO "consultations_old";
ALTER TABLE "Upload" RENAME TO "uploads_old";
ALTER TABLE "ActivityLog" RENAME TO "activity_logs_old";

-- Step 2: Create new tables with updated structure

-- Users table with UUID and role constraints
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Add role check constraint
ALTER TABLE "users" ADD CONSTRAINT "users_role_check"
    CHECK ("role" IN ('patient', 'agent_de_sante', 'admin'));

-- Patients table (one-to-one with users) - Complete medical record structure
CREATE TABLE "patients" (
    -- Identification & métadonnées
    "user_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(200),
    "birth_date" DATE NOT NULL,
    "sex_at_birth" VARCHAR(6) NOT NULL CHECK ("sex_at_birth" IN ('M', 'F', 'Other')),
    "gender_identity" VARCHAR(50),
    "national_id_number" TEXT, -- À CHIFFRER (PII)
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE,

    -- Contact & adresse
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100) DEFAULT 'France',
    "emergency_contact_name" VARCHAR(200),
    "emergency_contact_phone" VARCHAR(20),
    "relationship_to_patient" VARCHAR(100),

    -- Statut socio-démographique
    "marital_status" VARCHAR(20) CHECK ("marital_status" IN ('single', 'married', 'divorced', 'widowed', 'other')),
    "occupation" VARCHAR(100),
    "education_level" VARCHAR(50),
    "ethnicity" VARCHAR(50), -- OPTIONNEL, attention vie privée
    "smoking_status" VARCHAR(20) CHECK ("smoking_status" IN ('never', 'former', 'current')),
    "alcohol_use" VARCHAR(20) CHECK ("alcohol_use" IN ('none', 'social', 'moderate', 'high')),

    -- Mesures & signes vitaux
    "height_cm" NUMERIC(5,2) CHECK ("height_cm" > 0 AND "height_cm" < 300),
    "weight_kg" NUMERIC(6,2) CHECK ("weight_kg" > 0 AND "weight_kg" < 700),
    "bmi" NUMERIC(5,2) CHECK ("bmi" > 0 AND "bmi" < 100),
    "blood_pressure_systolic" INTEGER CHECK ("blood_pressure_systolic" > 0 AND "blood_pressure_systolic" < 300),
    "blood_pressure_diastolic" INTEGER CHECK ("blood_pressure_diastolic" > 0 AND "blood_pressure_diastolic" < 200),
    "heart_rate" INTEGER CHECK ("heart_rate" > 0 AND "heart_rate" < 300),
    "temperature_c" NUMERIC(4,2) CHECK ("temperature_c" > 30 AND "temperature_c" < 45),

    -- Antécédents médicaux (JSONB pour structures complexes)
    "chronic_conditions" JSONB, -- [{condition: string, diagnosed_at: date, notes: string}]
    "surgeries" JSONB, -- [{procedure: string, date: date, notes: string}]
    "family_history" JSONB, -- [{relation: string, condition: string}]
    "allergies" JSONB, -- [{substance: string, reaction: string, severity: string}]
    "current_medications" JSONB, -- [{drug: string, dose: string, frequency: string, start_date: date, prescriber: string}]

    -- Vaccinations
    "vaccinations" JSONB, -- [{vaccine: string, date: date, batch: string, provider: string}]

    -- Examens & résultats
    "lab_results" JSONB, -- Structure flexible pour résultats de laboratoire
    "imaging" JSONB, -- Références aux images médicales et rapports

    -- Données spécifiques femmes (uniquement si sex_at_birth = 'F')
    "menarche_age" SMALLINT CHECK ("menarche_age" >= 8 AND "menarche_age" <= 18),
    "menstrual_cycle_regular" BOOLEAN,
    "menstrual_cycle_length" SMALLINT CHECK ("menstrual_cycle_length" >= 21 AND "menstrual_cycle_length" <= 35),
    "contraception" JSONB, -- [{method: string, start_date: date, notes: string}]
    "pregnant_current" BOOLEAN,
    "pregnancy_details" JSONB, -- {gestational_age_weeks: number, expected_delivery_date: date, obstetric_history: [{G:number, P:number, dates: string}], complications: string}
    "gynecological_history" JSONB, -- {last_pap_date: date, last_mammogram_date: date, diagnoses: [{condition: string, date: date}]}

    -- Données spécifiques hommes (uniquement si sex_at_birth = 'M')
    "urological_history" JSONB, -- {prostate_issues: string, vasectomy: boolean, sexual_dysfunction: string}
    "testicular_exam_notes" TEXT,

    -- Santé mentale
    "mental_health_conditions" JSONB,
    "current_therapy" BOOLEAN,
    "suicidal_ideation_screened" BOOLEAN,

    -- Assurance & administratif
    "insurance_provider" VARCHAR(100),
    "insurance_number" TEXT, -- À CHIFFRER (PII)
    "consent_for_data_processing" BOOLEAN NOT NULL DEFAULT false,
    "consent_timestamp" TIMESTAMP WITH TIME ZONE,

    -- Sécurité & confidentialité
    "share_with_research" BOOLEAN NOT NULL DEFAULT false,

    -- Audit fields
    "created_by_user_id" TEXT,
    "modified_by_user_id" TEXT,
    "modified_at" TIMESTAMP WITH TIME ZONE,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "patients_birth_date_past" CHECK ("birth_date" < CURRENT_DATE),
    CONSTRAINT "patients_email_format" CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT "patients_phone_format" CHECK ("phone" ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT "patients_postal_code_format" CHECK ("postal_code" ~* '^[0-9]{5}$' OR "postal_code" IS NULL),
    CONSTRAINT "patients_female_fields_only" CHECK (
        ("sex_at_birth" != 'F' AND "menarche_age" IS NULL AND "menstrual_cycle_regular" IS NULL AND
         "menstrual_cycle_length" IS NULL AND "contraception" IS NULL AND "pregnant_current" IS NULL AND
         "pregnancy_details" IS NULL AND "gynecological_history" IS NULL) OR
        ("sex_at_birth" = 'F')
    ),
    CONSTRAINT "patients_male_fields_only" CHECK (
        ("sex_at_birth" != 'M' AND "urological_history" IS NULL AND "testicular_exam_notes" IS NULL) OR
        ("sex_at_birth" = 'M')
    )
);

-- Agents table (one-to-one with users)
CREATE TABLE "agents" (
    "user_id" TEXT NOT NULL,
    "fullname" TEXT,
    "license_number" TEXT,
    "specialty" TEXT,
    "phone" TEXT,
    "department" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("user_id")
);

-- Consultations table with UUID
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- Uploads table with UUID
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "patient_id" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- Activity logs table with enhanced audit fields
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_patient_id" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE UNIQUE INDEX "patients_patient_id_key" ON "patients"("patient_id");
CREATE INDEX "patients_patient_id_idx" ON "patients"("patient_id");
CREATE UNIQUE INDEX "agents_license_number_key" ON "agents"("license_number");
CREATE INDEX "agents_license_number_idx" ON "agents"("license_number");
CREATE INDEX "activity_logs_actor_user_id_idx" ON "activity_logs"("actor_user_id");
CREATE INDEX "activity_logs_target_patient_id_idx" ON "activity_logs"("target_patient_id");

-- Step 4: Add foreign key constraints
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Migrate existing data
-- Migrate users data (converting role 'médecin' to 'agent_de_sante')
INSERT INTO "users" ("id", "email", "password", "role", "created_at", "is_active")
SELECT
    gen_random_uuid()::text as "id",
    "email",
    COALESCE("password", '') as "password",
    CASE
        WHEN "role" = 'médecin' THEN 'agent_de_sante'
        WHEN "role" IN ('patient', 'agent_de_sante', 'admin') THEN "role"
        ELSE 'patient'
    END as "role",
    "createdAt" as "created_at",
    true as "is_active"
FROM "users_old";

-- Create a mapping of old user IDs to new UUIDs for data migration
CREATE TEMP TABLE user_id_mapping AS
SELECT u_old."id" as old_id, u_new."id" as new_id
FROM "users_old" u_old
JOIN "users" u_new ON u_old."email" = u_new."email";

-- Migrate patients data
INSERT INTO "patients" ("user_id", "patient_id", "first_name", "last_name", "created_at")
SELECT
    m."new_id" as "user_id",
    gen_random_uuid()::text as "patient_id",
    CASE
        WHEN position(' ' in u_old."fullname") > 0
        THEN split_part(u_old."fullname", ' ', 1)
        ELSE u_old."fullname"
    END as "first_name",
    CASE
        WHEN position(' ' in u_old."fullname") > 0
        THEN substring(u_old."fullname" from position(' ' in u_old."fullname") + 1)
        ELSE ''
    END as "last_name",
    u_old."createdAt" as "created_at"
FROM "users_old" u_old
JOIN user_id_mapping m ON u_old."id" = m."old_id"
WHERE u_old."role" IN ('patient', 'médecin') OR u_old."role" IS NULL;

-- Migrate agents data
INSERT INTO "agents" ("user_id", "fullname", "created_at")
SELECT
    m."new_id" as "user_id",
    u_old."fullname",
    u_old."createdAt" as "created_at"
FROM "users_old" u_old
JOIN user_id_mapping m ON u_old."id" = m."old_id"
WHERE u_old."role" = 'médecin';

-- Migrate consultations (using patient_id from patients table)
INSERT INTO "consultations" ("id", "patient_id", "agent_id", "date", "status", "notes", "created_at")
SELECT
    gen_random_uuid()::text as "id",
    COALESCE(p."patient_id", 'unknown') as "patient_id",
    COALESCE(a."user_id", 'unknown') as "agent_id",
    c_old."date",
    c_old."status",
    NULL as "notes",
    c_old."createdAt" as "created_at"
FROM "consultations_old" c_old
LEFT JOIN "patients" p ON c_old."patient" = (p."first_name" || ' ' || p."last_name")
LEFT JOIN "agents" a ON c_old."doctor" = a."fullname";

-- Migrate uploads
INSERT INTO "uploads" ("id", "filename", "path", "uploaded_by", "patient_id", "created_at")
SELECT
    gen_random_uuid()::text as "id",
    u_old."filename",
    u_old."path",
    COALESCE(m."new_id", 'unknown') as "uploaded_by",
    NULL as "patient_id",
    u_old."createdAt" as "created_at"
FROM "uploads_old" u_old
LEFT JOIN user_id_mapping m ON u_old."id" = m."old_id";

-- Migrate activity logs
INSERT INTO "activity_logs" ("id", "actor_user_id", "action", "details", "created_at")
SELECT
    gen_random_uuid()::text as "id",
    COALESCE(m."new_id", 'unknown') as "actor_user_id",
    a_old."action",
    a_old."details",
    a_old."createdAt" as "created_at"
FROM "activity_logs_old" a_old
LEFT JOIN user_id_mapping m ON a_old."userId" = m."old_id";

-- Step 6: Clean up temporary tables and old data
DROP TABLE user_id_mapping;
DROP TABLE "users_old";
DROP TABLE "consultations_old";
DROP TABLE "uploads_old";
DROP TABLE "activity_logs_old";

-- Step 7: Add comments for documentation
COMMENT ON TABLE "users" IS 'User accounts with role-based access control';
COMMENT ON TABLE "patients" IS 'Patient-specific data linked to user accounts';
COMMENT ON TABLE "agents" IS 'Healthcare agent data linked to user accounts';
COMMENT ON TABLE "consultations" IS 'Medical consultations between patients and agents';
COMMENT ON TABLE "uploads" IS 'File uploads with ownership tracking';
COMMENT ON TABLE "activity_logs" IS 'Audit logs for security and compliance';
