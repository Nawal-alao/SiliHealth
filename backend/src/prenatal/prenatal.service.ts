import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrenatalService {
  constructor(private prisma: PrismaService) {}

  async getFollowUp(patientId: string, userId: string) {
    const followUp = await this.prisma.prenatalFollowUp.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    
    const labResults = await this.prisma.labResult.findMany({
      where: { patientId },
      orderBy: { testDate: 'desc' },
      take: 20,
    });

    return { ok: true, followUp, labResults };
  }

  async createFollowUp(data: any, userId: string) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { userId },
      });

      if (!agent) {
        return { ok: false, error: 'Agent not found' };
      }

      // Check for high-risk factors
      const riskFactors = data.riskFactors || [];
      const riskLevel = riskFactors.length > 2 ? 'high' : (riskFactors.length > 0 ? 'moderate' : 'normal');

      const followUp = await this.prisma.prenatalFollowUp.create({
        data: {
          patientId: data.patientId,
          agentId: userId,
          gestationalWeek: data.gestationalWeek,
          riskLevel,
          riskFactors: riskFactors,
          nextVisitDate: new Date(data.nextVisitDate),
          notes: data.notes,
          alertTriggered: riskLevel === 'high',
          alertMessage: riskLevel === 'high' ? `High-risk pregnancy detected: ${riskFactors.join(', ')}` : null,
        },
      });

      // Create notification if high-risk
      if (riskLevel === 'high') {
        await this.prisma.notification.create({
          data: {
            userId,
            userRole: 'agent_de_sante',
            type: 'pregnancy_risk_alert',
            message: `High-risk pregnancy alert for patient ${data.patientId}`,
            data: { followUpId: followUp.id, riskLevel, riskFactors },
          },
        });
      }

      return { ok: true, followUp };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async updateFollowUp(followUpId: string, data: any, userId: string) {
    try {
      const updated = await this.prisma.prenatalFollowUp.update({
        where: { id: followUpId },
        data: {
          gestationalWeek: data.gestationalWeek,
          riskLevel: data.riskLevel,
          riskFactors: data.riskFactors,
          nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
          notes: data.notes,
        },
      });

      return { ok: true, followUp: updated };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getHighRiskAlerts(agentId: string) {
    const alerts = await this.prisma.prenatalFollowUp.findMany({
      where: {
        agentId,
        riskLevel: 'high',
        alertTriggered: true,
      },
      include: {
        patient: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { ok: true, alerts };
  }
}
