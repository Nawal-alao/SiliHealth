-- CreateTable
CREATE TABLE "qr_links" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "secure_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "last_scanned_at" TIMESTAMP(3),
    "scan_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "qr_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_logs" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "access_code" TEXT NOT NULL,
    "access_reason" TEXT NOT NULL,
    "accessed_data" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "diagnosis" TEXT,
    "recommendations" TEXT,
    "follow_up_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'completed',
    "duration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_links_secure_token_key" ON "qr_links"("secure_token");

-- CreateIndex
CREATE INDEX "qr_links_patient_id_idx" ON "qr_links"("patient_id");

-- CreateIndex
CREATE INDEX "qr_links_secure_token_idx" ON "qr_links"("secure_token");

-- CreateIndex
CREATE INDEX "qr_links_is_active_idx" ON "qr_links"("is_active");

-- CreateIndex
CREATE INDEX "emergency_logs_patient_id_idx" ON "emergency_logs"("patient_id");

-- CreateIndex
CREATE INDEX "emergency_logs_agent_id_idx" ON "emergency_logs"("agent_id");

-- CreateIndex
CREATE INDEX "emergency_logs_createdAt_idx" ON "emergency_logs"("createdAt");

-- CreateIndex
CREATE INDEX "consultations_patient_id_idx" ON "consultations"("patient_id");

-- CreateIndex
CREATE INDEX "consultations_agent_id_idx" ON "consultations"("agent_id");

-- CreateIndex
CREATE INDEX "consultations_createdAt_idx" ON "consultations"("createdAt");

-- CreateIndex
CREATE INDEX "consultations_status_idx" ON "consultations"("status");

-- AddForeignKey
ALTER TABLE "qr_links" ADD CONSTRAINT "qr_links_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_logs" ADD CONSTRAINT "emergency_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_logs" ADD CONSTRAINT "emergency_logs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
