import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle consultation
   */
  async create(createDto: CreateConsultationDto, agentId: string) {
    // Vérifier que l'agent existe et est bien un agent de santé
    const agent = await this.prisma.agent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      throw new ForbiddenException('Agent non trouvé');
    }

    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { patientId: createDto.patientId }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Créer la consultation
    const consultation = await this.prisma.consultation.create({
      data: {
        patientId: createDto.patientId,
        agentId,
        appointmentId: createDto.appointmentId,
        title: createDto.title,
        summary: createDto.summary,
        diagnosis: createDto.diagnosis,
        recommendations: createDto.recommendations,
        followUpDate: createDto.followUpDate ? new Date(createDto.followUpDate) : null,
        status: createDto.status || 'completed',
        duration: createDto.duration || 30,
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        },
        agent: {
          select: {
            userId: true,
            licenseNumber: true,
            specialty: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    // Log de l'action
    await this.logActivity(agentId, 'CONSULTATION_CREATED', createDto.patientId,
      `Consultation créée: ${createDto.title}`);

    return {
      ok: true,
      consultation
    };
  }

  /**
   * Lister les consultations d'un patient (pour agents ou le patient lui-même)
   */
  async getPatientConsultations(patientId: string, requesterId: string) {
    // Vérifier les permissions
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester) {
      throw new ForbiddenException('Utilisateur non trouvé');
    }

    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      include: { user: true }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    const isAgent = requester.role === 'agent_de_sante';
    const isOwner = patient.user.id === requesterId;

    if (!isAgent && !isOwner) {
      throw new ForbiddenException('Accès non autorisé aux consultations du patient');
    }

    const consultations = await this.prisma.consultation.findMany({
      where: { patientId },
      include: {
        agent: {
          select: {
            userId: true,
            licenseNumber: true,
            specialty: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      ok: true,
      patient: {
        patientId: patient.patientId,
        fullname: `${patient.firstName} ${patient.lastName}`,
      },
      consultations
    };
  }

  /**
   * Lister toutes les consultations d'un agent
   */
  async getAgentConsultations(agentId: string) {
    // Vérifier que l'agent existe
    const agent = await this.prisma.agent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      throw new ForbiddenException('Agent non trouvé');
    }

    const consultations = await this.prisma.consultation.findMany({
      where: { agentId },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      ok: true,
      agent: {
        userId: agent.userId,
        licenseNumber: agent.licenseNumber,
        specialty: agent.specialty,
      },
      consultations
    };
  }

  /**
   * Obtenir une consultation spécifique
   */
  async getConsultation(consultationId: string, requesterId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
        agent: {
          select: {
            userId: true,
            licenseNumber: true,
            specialty: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    if (!consultation) {
      throw new NotFoundException('Consultation non trouvée');
    }

    // Vérifier les permissions
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester) {
      throw new ForbiddenException('Utilisateur non trouvé');
    }

    const isAgent = requester.role === 'agent_de_sante';
    const isPatientOwner = consultation.patientId === consultation.patient.patientId &&
                          consultation.patient.user.id === requesterId;

    if (!isAgent && !isPatientOwner) {
      throw new ForbiddenException('Accès non autorisé à cette consultation');
    }

    return {
      ok: true,
      consultation
    };
  }

  /**
   * Mettre à jour une consultation
   */
  async updateConsultation(consultationId: string, updateData: any, updaterId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation) {
      throw new NotFoundException('Consultation non trouvée');
    }

    // Seuls les agents peuvent modifier les consultations
    const updater = await this.prisma.user.findUnique({
      where: { id: updaterId }
    });

    if (!updater || updater.role !== 'agent_de_sante') {
      throw new ForbiddenException('Seuls les agents de santé peuvent modifier les consultations');
    }

    // Seuls l'agent qui a créé la consultation ou un agent peuvent la modifier
    if (consultation.agentId !== updaterId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres consultations');
    }

    const updatedConsultation = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        ...updateData,
        followUpDate: updateData.followUpDate ? new Date(updateData.followUpDate) : null,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          }
        },
        agent: {
          select: {
            userId: true,
            specialty: true,
          }
        }
      }
    });

    // Log de la modification
    await this.logActivity(updaterId, 'CONSULTATION_UPDATED', consultation.patientId,
      `Consultation mise à jour: ${updatedConsultation.title}`);

    return {
      ok: true,
      consultation: updatedConsultation
    };
  }

  /**
   * Supprimer une consultation
   */
  async deleteConsultation(consultationId: string, deleterId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation) {
      throw new NotFoundException('Consultation non trouvée');
    }

    // Seuls les agents peuvent supprimer les consultations
    const deleter = await this.prisma.user.findUnique({
      where: { id: deleterId }
    });

    if (!deleter || deleter.role !== 'agent_de_sante') {
      throw new ForbiddenException('Seuls les agents de santé peuvent supprimer les consultations');
    }

    // Seuls l'agent qui a créé la consultation peut la supprimer
    if (consultation.agentId !== deleterId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres consultations');
    }

    await this.prisma.consultation.delete({
      where: { id: consultationId }
    });

    // Log de la suppression
    await this.logActivity(deleterId, 'CONSULTATION_DELETED', consultation.patientId,
      `Consultation supprimée: ${consultation.title}`);

    return {
      ok: true,
      message: 'Consultation supprimée'
    };
  }

  /**
   * Log une activité pour l'audit
   */
  private async logActivity(
    actorUserId: string,
    action: string,
    targetPatientId: string,
    details: string
  ) {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorUserId,
          action,
          targetPatientId,
          details,
        }
      });
    } catch (error) {
      this.logger.error("Erreur lors du logging d'activité:", (error as any)?.stack || error);
    }
  }
}
