import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabResultsService {
  constructor(private prisma: PrismaService) {}

  async getPatientLabResults(patientId: string, userId: string) {
    try {
      const results = await this.prisma.labResult.findMany({
        where: { patientId },
        orderBy: { testDate: 'desc' },
        take: 100,
      });

      // Group by test name for trend analysis
      const grouped = this.groupByTestName(results);

      return { ok: true, results, grouped };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async createLabResult(data: any, userId: string) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { userId },
      });

      if (!agent) {
        return { ok: false, error: 'Agent not found' };
      }

      // Check if value exceeds critical threshold
      const exceedsCritical = data.criticalThreshold && data.value > data.criticalThreshold;
      const abnormal = (data.value < data.referenceMin) || (data.value > data.referenceMax);

      const result = await this.prisma.labResult.create({
        data: {
          patientId: data.patientId,
          agentId: userId,
          testName: data.testName,
          value: data.value,
          unit: data.unit,
          referenceMin: data.referenceMin,
          referenceMax: data.referenceMax,
          abnormal,
          criticalThreshold: data.criticalThreshold,
          exceedsCritical,
          testDate: new Date(data.testDate),
        },
      });

      // Create alert notification if critical
      if (exceedsCritical) {
        await this.prisma.notification.create({
          data: {
            userId,
            userRole: 'agent_de_sante',
            type: 'lab_result_critical',
            message: `Critical lab result: ${data.testName} = ${data.value} ${data.unit} for patient ${data.patientId}`,
            data: { resultId: result.id, testName: data.testName, value: data.value },
          },
        });
      }

      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getCriticalResults(patientId: string) {
    try {
      const results = await this.prisma.labResult.findMany({
        where: {
          patientId,
          exceedsCritical: true,
        },
        orderBy: { testDate: 'desc' },
      });

      return { ok: true, criticalResults: results };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getLabStats(agentId: string) {
    try {
      const results = await this.prisma.labResult.findMany({
        where: { agentId },
      });

      const totalTests = results.length;
      const abnormalCount = results.filter((r) => r.abnormal).length;
      const criticalCount = results.filter((r) => r.exceedsCritical).length;

      const testsByName = this.groupByTestName(results);

      return {
        ok: true,
        stats: {
          totalTests,
          abnormalCount,
          criticalCount,
          abnormalPercentage: totalTests > 0 ? ((abnormalCount / totalTests) * 100).toFixed(2) : 0,
        },
        testsByName,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  private groupByTestName(results: any[]) {
    const grouped = {};
    results.forEach((result) => {
      if (!grouped[result.testName]) {
        grouped[result.testName] = [];
      }
      grouped[result.testName].push({
        value: result.value,
        date: result.testDate,
        abnormal: result.abnormal,
      });
    });
    return grouped;
  }
}
