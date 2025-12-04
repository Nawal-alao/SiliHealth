/*
  Warnings:

  - You are about to drop the column `created_at` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `patients` table. All the data in the column will be lost.
  - You are about to alter the column `height_cm` on the `patients` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `weight_kg` on the `patients` table. The data in that column could be lost. The data in that column will be cast from `Decimal(6,2)` to `DoublePrecision`.
  - You are about to alter the column `bmi` on the `patients` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `temperature_c` on the `patients` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "activity_logs" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "consultations" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "patient_id" DROP DEFAULT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "display_name" SET DATA TYPE TEXT,
ALTER COLUMN "birth_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "sex_at_birth" SET DATA TYPE TEXT,
ALTER COLUMN "gender_identity" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "address_line1" SET DATA TYPE TEXT,
ALTER COLUMN "address_line2" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "postal_code" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT,
ALTER COLUMN "emergency_contact_name" SET DATA TYPE TEXT,
ALTER COLUMN "emergency_contact_phone" SET DATA TYPE TEXT,
ALTER COLUMN "relationship_to_patient" SET DATA TYPE TEXT,
ALTER COLUMN "marital_status" SET DATA TYPE TEXT,
ALTER COLUMN "occupation" SET DATA TYPE TEXT,
ALTER COLUMN "education_level" SET DATA TYPE TEXT,
ALTER COLUMN "ethnicity" SET DATA TYPE TEXT,
ALTER COLUMN "smoking_status" SET DATA TYPE TEXT,
ALTER COLUMN "alcohol_use" SET DATA TYPE TEXT,
ALTER COLUMN "height_cm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "weight_kg" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "bmi" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "temperature_c" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "menarche_age" SET DATA TYPE INTEGER,
ALTER COLUMN "menstrual_cycle_length" SET DATA TYPE INTEGER,
ALTER COLUMN "insurance_provider" SET DATA TYPE TEXT,
ALTER COLUMN "consent_timestamp" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "modified_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "uploads" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP;

-- CreateIndex
CREATE INDEX "patients_birth_date_idx" ON "patients"("birth_date");

-- CreateIndex
CREATE INDEX "patients_sex_at_birth_idx" ON "patients"("sex_at_birth");
