import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto } from '../auth/dto/agent.dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async createAgent(createAgentDto: CreateAgentDto, userId: string) {
    // Vérifier que l'utilisateur existe et est un agent
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'agent_de_sante') {
      throw new BadRequestException('Only healthcare agents can create agent records');
    }

    // Vérifier si un dossier agent existe déjà
    const existingAgent = await this.prisma.agent.findUnique({
      where: { userId },
    });

    if (existingAgent) {
      throw new BadRequestException('Agent record already exists for this user');
    }

    return this.prisma.agent.create({
      data: {
        ...createAgentDto,
        userId,
      },
    });
  }

  async getAgentByUserId(userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent record not found');
    }

    return agent;
  }

  async updateMyProfile(userId: string, updateAgentDto: UpdateAgentDto) {
    // Vérifier que l'agent existe
    const existingAgent = await this.prisma.agent.findUnique({
      where: { userId },
    });

    if (!existingAgent) {
      throw new NotFoundException('Agent record not found');
    }

    return this.prisma.agent.update({
      where: { userId },
      data: updateAgentDto,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async getAllAgents(requestingUserId: string) {
    // Seulement les agents peuvent lister tous les agents
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser || requestingUser.role !== 'agent_de_sante') {
      throw new BadRequestException('Only healthcare agents can list all agents');
    }

    return this.prisma.agent.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }
}
