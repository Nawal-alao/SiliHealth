import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SharedAgendaService {
  constructor(private prisma: PrismaService) {}

  async getSharedAgenda(agentId: string) {
    try {
      const shared = await this.prisma.sharedAgenda.findMany({
        where: { agentId },
        include: {
          agent: true,
        },
      });

      // Fetch all appointments for the shared agents
      const sharedWithIds = [];
      shared.forEach((s) => {
        const agents = s.sharedWith as any[];
        sharedWithIds.push(...agents);
      });

      const appointments = await this.prisma.appointment.findMany({
        where: {
          OR: [
            { agentId },
            { agentId: { in: sharedWithIds } },
          ],
        },
        include: {
          patient: true,
          agent: true,
        },
        orderBy: { appointmentDate: 'asc' },
      });

      return { ok: true, shared, appointments };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async shareAppointment(data: any, userId: string) {
    try {
      const sharedAgenda = await this.prisma.sharedAgenda.create({
        data: {
          agentId: userId,
          appointmentId: data.appointmentId,
          sharedWith: data.sharedWith || [], // array of user_ids
        },
      });

      // Notify shared agents
      const sharedAgents = data.sharedWith as string[];
      for (const agentId of sharedAgents) {
        await this.prisma.notification.create({
          data: {
            userId: agentId,
            userRole: 'agent_de_sante',
            type: 'agenda_shared',
            message: `An appointment has been shared with you`,
            data: { sharedAgendaId: sharedAgenda.id },
          },
        });
      }

      return { ok: true, sharedAgenda };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getScheduleConflicts(agentId: string) {
    try {
      const appointments = await this.prisma.appointment.findMany({
        where: { agentId },
        orderBy: { appointmentDate: 'asc' },
      });

      const conflicts = [];
      for (let i = 0; i < appointments.length; i++) {
        for (let j = i + 1; j < appointments.length; j++) {
          const appt1 = appointments[i];
          const appt2 = appointments[j];

          // Check if appointments overlap
          const end1 = new Date(appt1.appointmentDate.getTime() + appt1.duration * 60000);
          const end2 = new Date(appt2.appointmentDate.getTime() + appt2.duration * 60000);

          if (appt1.appointmentDate < end2 && appt2.appointmentDate < end1) {
            conflicts.push({
              appointment1: appt1,
              appointment2: appt2,
              overlap: true,
            });
          }
        }
      }

      return { ok: true, conflicts, totalConflicts: conflicts.length };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
