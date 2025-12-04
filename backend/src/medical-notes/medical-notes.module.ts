import { Module } from '@nestjs/common';
import { MedicalNotesService } from './medical-notes.service';
import { MedicalNotesController } from './medical-notes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MedicalNotesController],
  providers: [MedicalNotesService, PrismaService],
  exports: [MedicalNotesService],
})
export class MedicalNotesModule {}
