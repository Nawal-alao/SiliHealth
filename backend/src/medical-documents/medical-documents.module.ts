import { Module } from '@nestjs/common';
import { MedicalDocumentsService } from './medical-documents.service';
import { MedicalDocumentsController } from './medical-documents.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MedicalDocumentsController],
  providers: [MedicalDocumentsService, PrismaService],
  exports: [MedicalDocumentsService],
})
export class MedicalDocumentsModule {}
