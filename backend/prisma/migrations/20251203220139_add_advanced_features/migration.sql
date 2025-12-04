/*
  Warnings:

  - You are about to drop the column `lab_results` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "lab_results";

-- CreateTable
CREATE TABLE "prenatal_follow_ups" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "gestational_week" INTEGER NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'normal',
    "risk_factors" JSONB,
    "next_visit_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "alert_triggered" BOOLEAN NOT NULL DEFAULT false,
    "alert_message" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "prenatal_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "reference_min" DOUBLE PRECISION,
    "reference_max" DOUBLE PRECISION,
    "abnormal" BOOLEAN NOT NULL DEFAULT false,
    "critical_threshold" DOUBLE PRECISION,
    "exceeds_critical" BOOLEAN NOT NULL DEFAULT false,
    "test_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_agendas" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "shared_with" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_statistics" (
    "id" TEXT NOT NULL,
    "center_id" TEXT,
    "center_name" TEXT,
    "agent_id" TEXT NOT NULL,
    "patients_followed" INTEGER NOT NULL DEFAULT 0,
    "consultations_completed" INTEGER NOT NULL DEFAULT 0,
    "exams_performed" INTEGER NOT NULL DEFAULT 0,
    "pregnancy_followed" INTEGER NOT NULL DEFAULT 0,
    "vaccinations_given" INTEGER NOT NULL DEFAULT 0,
    "chronic_condition_patients" INTEGER NOT NULL DEFAULT 0,
    "emergency_access_count" INTEGER NOT NULL DEFAULT 0,
    "report_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prenatal_follow_ups_patient_id_idx" ON "prenatal_follow_ups"("patient_id");

-- CreateIndex
CREATE INDEX "prenatal_follow_ups_agent_id_idx" ON "prenatal_follow_ups"("agent_id");

-- CreateIndex
CREATE INDEX "prenatal_follow_ups_risk_level_idx" ON "prenatal_follow_ups"("risk_level");

-- CreateIndex
CREATE INDEX "lab_results_patient_id_idx" ON "lab_results"("patient_id");

-- CreateIndex
CREATE INDEX "lab_results_agent_id_idx" ON "lab_results"("agent_id");

-- CreateIndex
CREATE INDEX "lab_results_test_name_idx" ON "lab_results"("test_name");

-- CreateIndex
CREATE INDEX "lab_results_abnormal_idx" ON "lab_results"("abnormal");

-- CreateIndex
CREATE INDEX "shared_agendas_agent_id_idx" ON "shared_agendas"("agent_id");

-- CreateIndex
CREATE INDEX "health_statistics_agent_id_idx" ON "health_statistics"("agent_id");

-- CreateIndex
CREATE INDEX "health_statistics_report_date_idx" ON "health_statistics"("report_date");

-- CreateIndex
CREATE INDEX "sync_queue_user_id_idx" ON "sync_queue"("user_id");

-- CreateIndex
CREATE INDEX "sync_queue_synced_idx" ON "sync_queue"("synced");

-- AddForeignKey
ALTER TABLE "prenatal_follow_ups" ADD CONSTRAINT "prenatal_follow_ups_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prenatal_follow_ups" ADD CONSTRAINT "prenatal_follow_ups_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_agendas" ADD CONSTRAINT "shared_agendas_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_statistics" ADD CONSTRAINT "health_statistics_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
