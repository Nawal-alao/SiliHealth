import { Controller, Get, Post, Param, Body, UseGuards, Req, Res } from '@nestjs/common';
import { HealthStatsService } from './health-stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FastifyReply } from 'fastify';

@Controller('api/health-stats')
export class HealthStatsController {
  constructor(private healthStatsService: HealthStatsService) {}

  @Get('agent/:agentId')
  @UseGuards(JwtAuthGuard)
  async getAgentStats(@Param('agentId') agentId: string) {
    return this.healthStatsService.getAgentStats(agentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async recordStats(@Body() data: any, @Req() req: any) {
    return this.healthStatsService.recordStats(data, req.user.id);
  }

  @Get('center/:centerId')
  @UseGuards(JwtAuthGuard)
  async getCenterStats(@Param('centerId') centerId: string) {
    return this.healthStatsService.getCenterStats(centerId);
  }

  @Get('export/pdf/:agentId')
  @UseGuards(JwtAuthGuard)
  async exportPDF(@Param('agentId') agentId: string, @Res() res: FastifyReply) {
    const pdf = await this.healthStatsService.exportToPDF(agentId);
    res.type('application/pdf');
    res.send(pdf);
  }

  @Get('export/csv/:agentId')
  @UseGuards(JwtAuthGuard)
  async exportCSV(@Param('agentId') agentId: string, @Res() res: FastifyReply) {
    const csv = await this.healthStatsService.exportToCSV(agentId);
    res.type('text/csv');
    res.send(csv);
  }
}
