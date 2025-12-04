import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Controller('api')
export class ConsultationsController {
  constructor(private svc: ConsultationsService) {}

  /**
   * Créer une nouvelle consultation (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Post('consultations')
  async create(@Body() createDto: CreateConsultationDto, @Request() req) {
    return this.svc.create(createDto, req.user.id);
  }

  /**
   * Obtenir une consultation spécifique
   */
  @UseGuards(JwtAuthGuard)
  @Get('consultations/:id')
  async getConsultation(@Param('id') consultationId: string, @Request() req) {
    return this.svc.getConsultation(consultationId, req.user.id);
  }

  /**
   * Lister les consultations d'un patient
   */
  @UseGuards(JwtAuthGuard)
  @Get('consultations/patient/:patientId')
  async getPatientConsultations(@Param('patientId') patientId: string, @Request() req) {
    return this.svc.getPatientConsultations(patientId, req.user.id);
  }

  /**
   * Lister les consultations d'un agent
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Get('consultations/agent/:agentId')
  async getAgentConsultations(@Param('agentId') agentId: string, @Request() req) {
    // Vérifier que l'agent demande ses propres consultations ou qu'un admin demande
    if (req.user.id !== agentId && req.user.role !== 'admin') {
      return { ok: false, error: 'Accès non autorisé' };
    }
    return this.svc.getAgentConsultations(agentId);
  }

  /**
   * Mettre à jour une consultation (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Put('consultations/:id')
  async updateConsultation(
    @Param('id') consultationId: string,
    @Body() updateData: any,
    @Request() req
  ) {
    return this.svc.updateConsultation(consultationId, updateData, req.user.id);
  }

  /**
   * Supprimer une consultation (agents seulement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent_de_sante')
  @Delete('consultations/:id')
  async deleteConsultation(@Param('id') consultationId: string, @Request() req) {
    return this.svc.deleteConsultation(consultationId, req.user.id);
  }

  /**
   * Ancienne route pour compatibilité (sera supprimée)
   * @deprecated Utiliser les nouvelles routes avec authentification
   */
  @Get('consultations')
  async list() {
    return this.svc.getAgentConsultations('deprecated');
  }
}
