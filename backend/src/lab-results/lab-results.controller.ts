import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LabResultsService } from './lab-results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/lab-results')
export class LabResultsController {
  constructor(private labResultsService: LabResultsService) {}

  @Get('patient/:patientId')
  @UseGuards(JwtAuthGuard)
  async getPatientLabResults(@Param('patientId') patientId: string, @Req() req: any) {
    return this.labResultsService.getPatientLabResults(patientId, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLabResult(@Body() data: any, @Req() req: any) {
    return this.labResultsService.createLabResult(data, req.user.id);
  }

  @Get('critical/:patientId')
  @UseGuards(JwtAuthGuard)
  async getCriticalResults(@Param('patientId') patientId: string) {
    return this.labResultsService.getCriticalResults(patientId);
  }

  @Get('stats/:agentId')
  @UseGuards(JwtAuthGuard)
  async getLabStats(@Param('agentId') agentId: string) {
    return this.labResultsService.getLabStats(agentId);
  }
}
