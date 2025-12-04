import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('queue')
  @UseGuards(JwtAuthGuard)
  async queueForSync(@Body() data: any, @Req() req: any) {
    return this.syncService.queueForSync(data, req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async getPendingSync(@Req() req: any) {
    return this.syncService.getPendingSync(req.user.id);
  }

  @Post('execute')
  @UseGuards(JwtAuthGuard)
  async executePendingSync(@Req() req: any) {
    return this.syncService.executePendingSync(req.user.id);
  }

  @Post('mark-synced')
  @UseGuards(JwtAuthGuard)
  async markSynced(@Body() data: any, @Req() req: any) {
    return this.syncService.markSynced(data.syncQueueId);
  }
}
