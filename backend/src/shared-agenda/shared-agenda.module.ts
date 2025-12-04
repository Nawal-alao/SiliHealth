import { Module } from '@nestjs/common';
import { SharedAgendaController } from './shared-agenda.controller';
import { SharedAgendaService } from './shared-agenda.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SharedAgendaController],
  providers: [SharedAgendaService, PrismaService],
})
export class SharedAgendaModule {}
