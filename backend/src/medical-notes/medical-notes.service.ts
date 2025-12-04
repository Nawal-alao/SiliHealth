import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalNoteDto, UpdateMedicalNoteDto } from './dto/create-medical-note.dto';

@Injectable()
export class MedicalNotesService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalNoteDto: CreateMedicalNoteDto) {
    const { patientId, agentId, ...data } = createMedicalNoteDto;

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

    return this.prisma.medicalNote.create({
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

  async findAll(patientId?: string, agentId?: string) {
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (agentId) where.agentId = agentId;

    return this.prisma.medicalNote.findMany({
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
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const note = await this.prisma.medicalNote.findUnique({
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

    if (!note) {
      throw new NotFoundException('Medical note not found');
    }

    return note;
  }

  async update(id: string, updateMedicalNoteDto: UpdateMedicalNoteDto) {
    const note = await this.prisma.medicalNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Medical note not found');
    }

    return this.prisma.medicalNote.update({
      where: { id },
      data: updateMedicalNoteDto,
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
    const note = await this.prisma.medicalNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Medical note not found');
    }

    return this.prisma.medicalNote.delete({
      where: { id },
    });
  }
}
