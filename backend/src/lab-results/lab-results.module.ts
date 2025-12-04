import { Module } from '@nestjs/common';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LabResultsController],
  providers: [LabResultsService, PrismaService],
})
export class LabResultsModule {}
