import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthStatsService {
  constructor(private prisma: PrismaService) {}

  async getAgentStats(agentId: string) {
    try {
      // Count patients followed
      const patientsFollowed = await this.prisma.consultation.findMany({
        where: { agentId },
        distinct: ['patientId'],
      });

      // Count consultations
      const consultationsCompleted = await this.prisma.consultation.count({
        where: { agentId, status: 'completed' },
      });

      // Count lab results
      const examsPerformed = await this.prisma.labResult.count({
        where: { agentId },
      });

      // Count prenatal follow-ups
      const pregnancyFollowed = await this.prisma.prenatalFollowUp.count({
        where: { agentId },
      });

      // Count vaccinations (if stored in medical notes with type = 'vaccination')
      const vaccinationsGiven = await this.prisma.medicalNote.count({
        where: { agentId, type: 'vaccination' },
      });

      // Count chronic conditions patients
      const chronicConditionPatients = await this.prisma.medicalNote.findMany({
        where: { agentId, type: 'chronic_condition' },
        distinct: ['patientId'],
      });

      // Count emergency access
      const emergencyAccessCount = await this.prisma.emergencyLog.count({
        where: { agentId },
      });

      const stats = {
        patientsFollowed: patientsFollowed.length,
        consultationsCompleted,
        examsPerformed,
        pregnancyFollowed,
        vaccinationsGiven,
        chronicConditionPatients: chronicConditionPatients.length,
        emergencyAccessCount,
        reportDate: new Date(),
      };

      // Save stats
      await this.prisma.healthStatistic.create({
        data: {
          agentId,
          ...stats,
          reportDate: new Date(),
        },
      });

      return { ok: true, stats };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async recordStats(data: any, userId: string) {
    try {
      const stat = await this.prisma.healthStatistic.create({
        data: {
          agentId: userId,
          centerName: data.centerName,
          patientsFollowed: data.patientsFollowed || 0,
          consultationsCompleted: data.consultationsCompleted || 0,
          examsPerformed: data.examsPerformed || 0,
          pregnancyFollowed: data.pregnancyFollowed || 0,
          vaccinationsGiven: data.vaccinationsGiven || 0,
          chronicConditionPatients: data.chronicConditionPatients || 0,
          emergencyAccessCount: data.emergencyAccessCount || 0,
          reportDate: new Date(data.reportDate || new Date()),
        },
      });

      return { ok: true, stat };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getCenterStats(centerId: string) {
    try {
      const stats = await this.prisma.healthStatistic.findMany({
        where: { centerName: centerId },
        orderBy: { reportDate: 'desc' },
        include: {
          agent: true,
        },
        take: 100,
      });

      // Aggregate stats
      const aggregate = {
        totalPatientsFollowed: stats.reduce((sum, s) => sum + s.patientsFollowed, 0),
        totalConsultations: stats.reduce((sum, s) => sum + s.consultationsCompleted, 0),
        totalExams: stats.reduce((sum, s) => sum + s.examsPerformed, 0),
        totalPregnancies: stats.reduce((sum, s) => sum + s.pregnancyFollowed, 0),
        totalVaccinations: stats.reduce((sum, s) => sum + s.vaccinationsGiven, 0),
        averageEmergencyAccess: (stats.reduce((sum, s) => sum + s.emergencyAccessCount, 0) / stats.length).toFixed(2),
      };

      return { ok: true, stats, aggregate };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async exportToPDF(agentId: string) {
    // Simplified PDF generation - in production use a library like pdfkit or jspdf
    const stats = await this.prisma.healthStatistic.findMany({
      where: { agentId },
      orderBy: { reportDate: 'desc' },
      take: 12,
    });

    const csvContent = this.generateCSVContent(stats);
    // In production, use a proper PDF library
    return Buffer.from(`PDF Report\n\n${csvContent}`);
  }

  async exportToCSV(agentId: string) {
    const stats = await this.prisma.healthStatistic.findMany({
      where: { agentId },
      orderBy: { reportDate: 'desc' },
      take: 12,
    });

    return this.generateCSVContent(stats);
  }

  private generateCSVContent(stats: any[]) {
    let csv = 'Report Date,Patients Followed,Consultations,Exams,Pregnancies,Vaccinations,Emergency Access\n';
    stats.forEach((stat) => {
      csv += `${stat.reportDate.toISOString()},${stat.patientsFollowed},${stat.consultationsCompleted},${stat.examsPerformed},${stat.pregnancyFollowed},${stat.vaccinationsGiven},${stat.emergencyAccessCount}\n`;
    });
    return csv;
  }
}
