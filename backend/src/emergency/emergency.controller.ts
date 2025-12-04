import { Body, Controller, Get, Post, Param, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  /**
   * Accès d'urgence direct via ID patient (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Post('emergency/access/:patientId')
  async emergencyAccess(
    @Param('patientId') patientId: string,
    @Body() body: { accessCode: string; accessReason: string },
    @Request() req,
    @Ip() ipAddress: string
  ) {
    return this.emergencyService.getEmergencyInfo(
      patientId,
      req.user.id,
      body.accessCode,
      body.accessReason,
      ipAddress,
      req.headers['user-agent'] || ''
    );
  }

  /**
   * Générer un rapport d'urgence pour un patient (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Get('emergency/report/:patientId')
  async generateEmergencyReport(@Param('patientId') patientId: string) {
    return this.emergencyService.generateEmergencyReport(patientId);
  }

  /**
   * Lister les logs d'accès d'urgence (admins seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('emergency/logs')
  async getEmergencyLogs(
    @Query('patientId') patientId?: string,
    @Query('agentId') agentId?: string,
    @Query('limit') limit?: string
  ) {
    return this.emergencyService.getEmergencyLogs(
      patientId,
      agentId,
      limit ? parseInt(limit) : 50
    );
  }
}
