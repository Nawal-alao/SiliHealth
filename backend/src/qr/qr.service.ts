import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Génère un nouveau QR code pour un patient
   */
  async generateQRCode(patientId: string, createdBy: string) {
    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      include: { user: true }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Vérifier que l'utilisateur qui crée est un agent de santé
    const creator = await this.prisma.user.findUnique({
      where: { id: createdBy }
    });

    if (!creator || creator.role !== 'agent_de_sante') {
      throw new ForbiddenException('Seuls les agents de santé peuvent générer des QR codes');
    }

    // Désactiver les anciens QR codes du patient
    await this.prisma.qRLink.updateMany({
      where: { patientId, isActive: true },
      data: { isActive: false }
    });

    // Générer un token sécurisé unique
    const secureToken = randomBytes(32).toString('hex');

    // Créer le nouveau lien QR
    const qrLink = await this.prisma.qRLink.create({
      data: {
        patientId,
        secureToken,
        createdBy,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      }
    });

    // Log de l'action
    await this.logActivity(createdBy, 'QR_CODE_GENERATED', patientId, `QR code généré pour le patient ${patient.firstName} ${patient.lastName}`);

    return {
      ok: true,
      qrLink: {
        id: qrLink.id,
        patientId: qrLink.patientId,
        secureToken: qrLink.secureToken,
        expiresAt: qrLink.expiresAt,
        qrUrl: `/patient/scan/${qrLink.secureToken}`,
      }
    };
  }

  /**
   * Accès QR par patientId direct (pour /qr-access/[id])
   */
  async accessByPatientId(patientId: string, userAgent?: string, ipAddress?: string) {
    // Trouver le patient directement
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Retourner les informations minimales
    return {
      ok: true,
      patient: {
        id: patient.user.id,
        patientId: patient.patientId,
        fullname: `${patient.firstName} ${patient.lastName}`,
        email: patient.user.email,
        sexAtBirth: patient.sexAtBirth,
        birthDate: patient.birthDate,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        currentMedications: patient.currentMedications,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        createdAt: patient.user.createdAt,
      }
    };
  }

  /**
   * Logger un accès QR
   */
  async logQRAccess(
    patientId: string,
    emergency: boolean,
    deviceFingerprint: string,
    userAgent: string,
    ipAddress: string
  ) {
    try {
      // Vérifier que le patient existe
      const patient = await this.prisma.patient.findUnique({
        where: { patientId }
      });

      if (!patient) {
        throw new NotFoundException('Patient non trouvé');
      }

      // Créer un log d'accès dans ActivityLog
      await this.prisma.activityLog.create({
        data: {
          actorUserId: 'anonymous',
          action: emergency ? 'QR_EMERGENCY_ACCESS' : 'QR_ACCESS',
          targetPatientId: patientId,
          details: JSON.stringify({
            emergency,
            deviceFingerprint,
            userAgent,
            ipAddress,
            timestamp: new Date().toISOString()
          }),
          ipAddress,
          userAgent,
        }
      });

      // Si mode urgence, créer aussi un log d'urgence
      if (emergency) {
        await this.prisma.emergencyLog.create({
          data: {
            patientId,
            agentId: 'anonymous', // Pas d'agent en mode public
            accessCode: 'PUBLIC_QR',
            accessReason: 'Accès d\'urgence via QR code public',
            accessedData: JSON.stringify({
              deviceFingerprint,
              userAgent,
              ipAddress
            }),
            ipAddress,
            userAgent,
          }
        });
      }

      return {
        ok: true,
        message: 'Accès journalisé avec succès'
      };
    } catch (error) {
      this.logger.error('Erreur journalisation QR:', (error as any)?.stack || error);
      throw error;
    }
  }

  /**
   * Scanne et vérifie un QR code
   */
  async scanQRCode(secureToken: string, userAgent?: string, ipAddress?: string) {
    // Trouver le lien QR actif
    const qrLink = await this.prisma.qRLink.findUnique({
      where: { secureToken },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              }
            }
          }
        }
      }
    });

    if (!qrLink || !qrLink.isActive) {
      throw new NotFoundException('QR code invalide ou expiré');
    }

    // Vérifier l'expiration
    if (qrLink.expiresAt && qrLink.expiresAt < new Date()) {
      throw new BadRequestException('QR code expiré');
    }

    // Mettre à jour les statistiques du scan
    await this.prisma.qRLink.update({
      where: { id: qrLink.id },
      data: {
        lastScannedAt: new Date(),
        scanCount: { increment: 1 }
      }
    });

    // Log du scan
    await this.logActivity('anonymous', 'QR_CODE_SCANNED', qrLink.patientId, `QR code scanné - UserAgent: ${userAgent || 'unknown'}`, ipAddress, userAgent);

    // Create a notification for the patient about the scan
    try{
      const patientUserId = qrLink.patient.user.id;
      await this.prisma.notification.create({
        data: {
          userId: patientUserId,
          userRole: 'patient',
          type: 'qr_scan',
          message: `Votre QR code a été scanné.`,
          data: { secureToken: qrLink.secureToken, userAgent, ipAddress }
        }
      });
    }catch(e){ this.logger.error('Erreur création notification QR scan', (e as any)?.stack || e); }

    return {
      ok: true,
      patient: {
        id: qrLink.patient.user.id,
        patientId: qrLink.patient.patientId,
        fullname: `${qrLink.patient.firstName} ${qrLink.patient.lastName}`,
        email: qrLink.patient.user.email,
        sexAtBirth: qrLink.patient.sexAtBirth,
        birthDate: qrLink.patient.birthDate,
        bloodType: qrLink.patient.bloodType,
        createdAt: qrLink.patient.user.createdAt,
        lastScanned: qrLink.lastScannedAt,
      },
      qrInfo: {
        id: qrLink.id,
        secureToken: qrLink.secureToken,
        expiresAt: qrLink.expiresAt,
        scanCount: qrLink.scanCount + 1,
      }
    };
  }

  /**
   * Accès d'urgence via QR code (pour les situations critiques)
   */
  async emergencyAccess(secureToken: string, accessCode: string, agentId: string, accessReason: string) {
    // Vérifier le code d'urgence (pour simplifier, on accepte n'importe quel code à 6 chiffres)
    if (!accessCode || accessCode.length !== 6 || !/^\d{6}$/.test(accessCode)) {
      throw new BadRequestException('Code d\'urgence invalide (6 chiffres requis)');
    }

    // Scanner le QR d'abord
    const scanResult = await this.scanQRCode(secureToken);
    const patientId = scanResult.patient.patientId;

    // Récupérer les informations vitales du patient
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
        pregnantCurrent: true,
        // Données critiques uniquement
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Journaliser l'accès d'urgence
    await this.prisma.emergencyLog.create({
      data: {
        patientId,
        agentId,
        accessCode,
        accessReason,
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
        }),
      }
    });

    // Create a notification for the patient about emergency access
    try{
      const patientWithUser = await this.prisma.patient.findUnique({ where: { patientId }, include: { user: true } });
      const patientUserId = patientWithUser?.user?.id;
      if(patientUserId){
        await this.prisma.notification.create({
          data: {
            userId: patientUserId,
            userRole: 'patient',
            type: 'emergency_access',
            message: `Accès d'urgence à votre dossier a été effectué.`,
            data: { agentId, accessReason }
          }
        });
      }
    }catch(e){ this.logger.error('Erreur création notification emergency', (e as any)?.stack || e); }

    // Log de l'accès d'urgence
    await this.logActivity(agentId, 'EMERGENCY_ACCESS', patientId, `Accès d'urgence: ${accessReason}`);

    return {
      ok: true,
      emergency: {
        patient: {
          patientId: patient.patientId,
          fullname: `${patient.firstName} ${patient.lastName}`,
          sexAtBirth: patient.sexAtBirth,
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
        },
        accessedAt: new Date().toISOString(),
        accessReason,
      }
    };
  }

  /**
   * Désactiver un QR code
   */
  async deactivateQRCode(qrLinkId: string, deactivatedBy: string) {
    const qrLink = await this.prisma.qRLink.findUnique({
      where: { id: qrLinkId },
      include: { patient: true }
    });

    if (!qrLink) {
      throw new NotFoundException('QR code non trouvé');
    }

    await this.prisma.qRLink.update({
      where: { id: qrLinkId },
      data: { isActive: false }
    });

    // Log de la désactivation
    await this.logActivity(deactivatedBy, 'QR_CODE_DEACTIVATED', qrLink.patientId, 'QR code désactivé');

    return { ok: true, message: 'QR code désactivé' };
  }

  /**
   * Lister les QR codes d'un patient
   */
  async getPatientQRCodes(patientId: string, requesterId: string) {
    // Vérifier les permissions
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester) {
      throw new ForbiddenException('Utilisateur non trouvé');
    }

    // Vérifier que c'est un agent OU le patient lui-même
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
      throw new ForbiddenException('Accès non autorisé');
    }

    const qrCodes = await this.prisma.qRLink.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      ok: true,
      patient: {
        patientId: patient.patientId,
        fullname: `${patient.firstName} ${patient.lastName}`,
      },
      qrCodes
    };
  }

  /**
   * Log une activité pour l'audit
   */
  private async logActivity(
    actorUserId: string,
    action: string,
    targetPatientId: string,
    details: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorUserId,
          action,
          targetPatientId,
          details,
          ipAddress,
          userAgent,
        }
      });
    } catch (error) {
      this.logger.error("Erreur lors du logging d'activité:", (error as any)?.stack || error);
    }
  }
}
