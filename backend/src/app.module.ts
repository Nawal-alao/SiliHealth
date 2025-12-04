import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AgentsModule } from './agents/agents.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { UploadModule } from './upload/upload.module';
import { QrModule } from './qr/qr.module';
import { EmergencyModule } from './emergency/emergency.module';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalNotesModule } from './medical-notes/medical-notes.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { MedicalDocumentsModule } from './medical-documents/medical-documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrenatalModule } from './prenatal/prenatal.module';
import { LabResultsModule } from './lab-results/lab-results.module';
import { HealthStatsModule } from './health-stats/health-stats.module';
import { SharedAgendaModule } from './shared-agenda/shared-agenda.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    AgentsModule,
    ConsultationsModule,
    UploadModule,
    QrModule,
    EmergencyModule,
    HealthModule,
    AppointmentsModule,
    MedicalNotesModule,
    TreatmentsModule,
    MedicalDocumentsModule,
    NotificationsModule,
    PrenatalModule,
    LabResultsModule,
    HealthStatsModule,
    SharedAgendaModule,
    SyncModule,
  ],
  providers: [PrismaService]
})
export class AppModule {}
