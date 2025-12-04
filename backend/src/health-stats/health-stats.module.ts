import { Module } from '@nestjs/common';
import { HealthStatsController } from './health-stats.controller';
import { HealthStatsService } from './health-stats.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HealthStatsController],
  providers: [HealthStatsService, PrismaService],
})
export class HealthStatsModule {}
