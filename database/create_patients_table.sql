-- Script SQL pour créer la table patients complète avec tous les champs médicaux
-- À exécuter sur PostgreSQL après avoir activé l'extension UUID si nécessaire

-- Activer l'extension UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table patients - Dossier médical complet
CREATE TABLE IF NOT EXISTS "patients" (
    -- Identification & métadonnées
    "user_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
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

-- Créer les index pour les performances
CREATE UNIQUE INDEX IF NOT EXISTS "patients_patient_id_key" ON "patients"("patient_id");
CREATE INDEX IF NOT EXISTS "patients_patient_id_idx" ON "patients"("patient_id");
CREATE INDEX IF NOT EXISTS "patients_birth_date_idx" ON "patients"("birth_date");
CREATE INDEX IF NOT EXISTS "patients_sex_at_birth_idx" ON "patients"("sex_at_birth");
CREATE INDEX IF NOT EXISTS "patients_created_at_idx" ON "patients"("created_at");

-- Ajouter les clés étrangères
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Commentaires pour la documentation
COMMENT ON TABLE "patients" IS 'Dossier médical complet des patients avec données structurées';
COMMENT ON COLUMN "patients"."patient_id" IS 'Identifiant public UUID pour la carte santé';
COMMENT ON COLUMN "patients"."national_id_number" IS 'À CHIFFRER - Numéro d''identité national (PII)';
COMMENT ON COLUMN "patients"."insurance_number" IS 'À CHIFFRER - Numéro d''assurance (PII)';
COMMENT ON COLUMN "patients"."chronic_conditions" IS 'Liste des conditions chroniques avec dates et notes';
COMMENT ON COLUMN "patients"."menarche_age" IS 'Âge des premières règles (uniquement pour femmes)';
COMMENT ON COLUMN "patients"."pregnancy_details" IS 'Détails de grossesse actuels (uniquement pour femmes)';
COMMENT ON COLUMN "patients"."urological_history" IS 'Historique urologique (uniquement pour hommes)';
COMMENT ON COLUMN "patients"."consent_for_data_processing" IS 'Consentement RGPD obligatoire';

-- Exemple d'insertion pour une patiente femme
-- INSERT INTO patients (
--     user_id, first_name, last_name, birth_date, sex_at_birth,
--     consent_for_data_processing, menarche_age, pregnant_current
-- ) VALUES (
--     'uuid-user-id', 'Marie', 'Dupont', '1990-05-15', 'F',
--     true, 13, false
-- );

-- Exemple d'insertion pour un patient homme
-- INSERT INTO patients (
--     user_id, first_name, last_name, birth_date, sex_at_birth,
--     consent_for_data_processing
-- ) VALUES (
--     'uuid-user-id', 'Jean', 'Martin', '1985-03-20', 'M',
--     true
-- );
