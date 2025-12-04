import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService?: NotificationsService
  ) {}

  /**
   * Valider un code d'accès d'urgence
   */
  async validateEmergencyCode(accessCode: string): Promise<boolean> {
    // Pour la démonstration, accepter les codes à 6 chiffres
    // En production, utiliser un système plus sophistiqué
    return /^\d{6}$/.test(accessCode);
  }

  /**
   * Obtenir les informations d'urgence d'un patient via son ID patient
   */
  async getEmergencyInfo(patientId: string, agentId: string, accessCode: string, accessReason: string, ipAddress?: string, userAgent?: string) {
    // Valider le code d'urgence
    const isValidCode = await this.validateEmergencyCode(accessCode);
    if (!isValidCode) {
      throw new BadRequestException('Code d\'urgence invalide');
    }

    // Vérifier que l'agent existe
    const agent = await this.prisma.agent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      throw new BadRequestException('Agent non autorisé');
    }

    // Récupérer les informations d'urgence du patient
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      select: {
        patientId: true,
        firstName: true,
        lastName: true,
        sexAtBirth: true,
        birthDate: true,
        bloodType: true,
        heightCm: true,
        weightKg: true,
        allergies: true,
        chronicConditions: true,
        currentMedications: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        pregnantCurrent: true,
        // Informations critiques seulement
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Journaliser l'accès d'urgence avec IP et userAgent
    await this.prisma.emergencyLog.create({
      data: {
        patientId,
        agentId,
        accessCode,
        accessReason,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        accessedData: JSON.stringify({
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
          currentMedications: patient.currentMedications,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone,
          },
          pregnantCurrent: patient.pregnantCurrent,
          vitalSigns: {
            heightCm: patient.heightCm,
            weightKg: patient.weightKg,
          }
        }),
      }
    });

    // Log de l'activité
    await this.logActivity(agentId, 'EMERGENCY_ACCESS_DIRECT', patientId,
      `Accès d'urgence direct: ${accessReason}`);

    // Créer une notification pour le patient
    if (this.notificationsService) {
      try {
        await this.notificationsService.createEmergencyAccessNotification(patientId, agentId, accessReason);
      } catch (e) {
        this.logger.error('Erreur création notification accès urgence:', e);
      }
    }

    return {
      ok: true,
      emergency: {
        patient: {
          patientId: patient.patientId,
          fullname: `${patient.firstName} ${patient.lastName}`,
          sexAtBirth: patient.sexAtBirth,
          birthDate: patient.birthDate,
        },
        criticalInfo: {
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
          currentMedications: patient.currentMedications,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone,
          },
          pregnantCurrent: patient.pregnantCurrent,
          vitalSigns: {
            heightCm: patient.heightCm,
            weightKg: patient.weightKg,
          }
        },
        accessedAt: new Date().toISOString(),
        accessReason,
        agent: {
          userId: agent.userId,
          licenseNumber: agent.licenseNumber,
          specialty: agent.specialty,
        }
      }
    };
  }

  /**
   * Lister les accès d'urgence pour audit (admins seulement)
   */
  async getEmergencyLogs(patientId?: string, agentId?: string, limit: number = 50) {
    const where: any = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    const logs = await this.prisma.emergencyLog.findMany({
      where,
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
            licenseNumber: true,
            specialty: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      ok: true,
      logs,
      total: logs.length,
    };
  }

  /**
   * Générer un rapport d'urgence pour un patient
   */
  async generateEmergencyReport(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      select: {
        patientId: true,
        firstName: true,
        lastName: true,
        sexAtBirth: true,
        bloodType: true,
        allergies: true,
        chronicConditions: true,
        currentMedications: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Récupérer les derniers accès d'urgence
    const recentLogs = await this.prisma.emergencyLog.findMany({
      where: { patientId },
      include: {
        agent: {
          select: {
            licenseNumber: true,
            specialty: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      ok: true,
      report: {
        patient: {
          patientId: patient.patientId,
          fullname: `${patient.firstName} ${patient.lastName}`,
          sexAtBirth: patient.sexAtBirth,
        },
        emergencyInfo: {
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
          currentMedications: patient.currentMedications,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone,
          }
        },
        recentAccess: recentLogs.map(log => ({
          accessedAt: log.createdAt,
          agent: log.agent.licenseNumber,
          reason: log.accessReason,
        })),
        generatedAt: new Date().toISOString(),
      }
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
      this.logger.error("Erreur lors du logging d'activité d'urgence:", (error as any)?.stack || error);
    }
  }
}
