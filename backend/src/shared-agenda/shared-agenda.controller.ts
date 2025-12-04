import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SharedAgendaService } from './shared-agenda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/shared-agenda')
export class SharedAgendaController {
  constructor(private sharedAgendaService: SharedAgendaService) {}

  @Get('agent/:agentId')
  @UseGuards(JwtAuthGuard)
  async getSharedAgenda(@Param('agentId') agentId: string) {
    return this.sharedAgendaService.getSharedAgenda(agentId);
  }

  @Post('share')
  @UseGuards(JwtAuthGuard)
  async shareAppointment(@Body() data: any, @Req() req: any) {
    return this.sharedAgendaService.shareAppointment(data, req.user.id);
  }

  @Get('conflicts/:agentId')
  @UseGuards(JwtAuthGuard)
  async getScheduleConflicts(@Param('agentId') agentId: string) {
    return this.sharedAgendaService.getScheduleConflicts(agentId);
  }
}
