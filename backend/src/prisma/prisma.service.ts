import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Allow dynamic access to generated model delegates (e.g. prisma.prenatalFollowUp)
  // Prisma generates these properties at runtime; this index signature prevents
  // TypeScript complaints in services while keeping runtime typing from PrismaClient.
  [key: string]: any;
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
