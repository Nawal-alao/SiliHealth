import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PrenatalService } from './prenatal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/prenatal')
export class PrenatalController {
  constructor(private prenatalService: PrenatalService) {}

  @Get(':patientId')
  @UseGuards(JwtAuthGuard)
  async getFollowUp(@Param('patientId') patientId: string, @Req() req: any) {
    return this.prenatalService.getFollowUp(patientId, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFollowUp(@Body() data: any, @Req() req: any) {
    return this.prenatalService.createFollowUp(data, req.user.id);
  }

  @Put(':followUpId')
  @UseGuards(JwtAuthGuard)
  async updateFollowUp(
    @Param('followUpId') followUpId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.prenatalService.updateFollowUp(followUpId, data, req.user.id);
  }

  @Get('alerts/:agentId')
  @UseGuards(JwtAuthGuard)
  async getHighRiskAlerts(@Param('agentId') agentId: string) {
    return this.prenatalService.getHighRiskAlerts(agentId);
  }
}
