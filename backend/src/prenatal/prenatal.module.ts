import { Module } from '@nestjs/common';
import { PrenatalController } from './prenatal.controller';
import { PrenatalService } from './prenatal.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PrenatalController],
  providers: [PrenatalService, PrismaService],
})
export class PrenatalModule {}
