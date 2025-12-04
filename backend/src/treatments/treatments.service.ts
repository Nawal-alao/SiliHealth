import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto, UpdateTreatmentDto } from './dto/create-treatment.dto';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createTreatmentDto: CreateTreatmentDto) {
    const { patientId, agentId, ...data } = createTreatmentDto;

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

    return this.prisma.treatment.create({
      data: {
        ...data,
        patientId,
        agentId,
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
  }

  async findAll(patientId?: string, agentId?: string, status?: string) {
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;

    return this.prisma.treatment.findMany({
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
        startDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
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

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    return treatment;
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    return this.prisma.treatment.update({
      where: { id },
      data: updateTreatmentDto,
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
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Treatment not found');
    }

    return this.prisma.treatment.delete({
      where: { id },
    });
  }
}
