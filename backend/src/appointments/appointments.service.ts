import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService?: NotificationsService
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, createdBy: string) {
    const { patientId, agentId, ...data } = createAppointmentDto;

    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Vérifier que l'agent existe
    const agent = await this.prisma.agent.findUnique({
      where: { userId: agentId },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...data,
        patientId,
        agentId,
        createdBy,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
        agent: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Créer une notification pour le patient et l'agent
    if (this.notificationsService) {
      try {
        await this.notificationsService.createAppointmentNotification(
          patientId,
          agentId,
          appointment.id,
          new Date(data.appointmentDate),
          data.title
        );
      } catch (e) {
        // Ne pas faire échouer la création du rendez-vous si la notification échoue
        console.error('Erreur création notification rendez-vous:', e);
      }
    }

    return appointment;
  }

  async findAll(agentId?: string, patientId?: string) {
    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (patientId) where.patientId = patientId;

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
        agent: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
            birthDate: true,
            sexAtBirth: true,
          },
        },
        agent: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
            specialty: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
        agent: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, agentId?: string) {
    const where: any = {
      appointmentDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (agentId) where.agentId = agentId;

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
  }
}
