import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalDocumentDto, UpdateMedicalDocumentDto } from './dto/create-medical-document.dto';

@Injectable()
export class MedicalDocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalDocumentDto: CreateMedicalDocumentDto) {
    const { patientId, agentId, ...data } = createMedicalDocumentDto;

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

    return this.prisma.medicalDocument.create({
      data: {
        title: data.title,
        description: data.description,
        documentType: data.documentType,
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || 'application/octet-stream',
        isConfidential: data.isConfidential || false,
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

  async findAll(patientId?: string, agentId?: string, documentType?: string) {
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (agentId) where.agentId = agentId;
    if (documentType) where.documentType = documentType;

    return this.prisma.medicalDocument.findMany({
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
    const document = await this.prisma.medicalDocument.findUnique({
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

    if (!document) {
      throw new NotFoundException('Medical document not found');
    }

    return document;
  }

  async update(id: string, updateMedicalDocumentDto: UpdateMedicalDocumentDto) {
    const document = await this.prisma.medicalDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Medical document not found');
    }

    return this.prisma.medicalDocument.update({
      where: { id },
      data: updateMedicalDocumentDto,
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
    const document = await this.prisma.medicalDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Medical document not found');
    }

    return this.prisma.medicalDocument.delete({
      where: { id },
    });
  }
}
