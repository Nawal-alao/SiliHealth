import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from '../auth/dto/agent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('api/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @Roles('agent_de_sante')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      });
      return new HttpException({
        ok: false,
        error: 'Validation failed',
        details: messages,
      }, HttpStatus.BAD_REQUEST);
    },
  }))
  async createAgent(@Body() createAgentDto: CreateAgentDto, @Req() req) {
    try {
      const userId = req.user.id;
      const agent = await this.agentsService.createAgent(createAgentDto, userId);
      return {
        ok: true,
        message: 'Agent record created successfully',
        agent,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Agent creation failed',
        details: error.message,
      };
    }
  }

  @Get()
  @Roles('agent_de_sante')
  async getAllAgents(@Req() req) {
    const userId = req.user.id;
    const agents = await this.agentsService.getAllAgents(userId);
    return {
      ok: true,
      agents,
      total: agents.length,
    };
  }

  @Get('profile')
  @Roles('agent_de_sante')
  async getMyProfile(@Req() req) {
    const userId = req.user.id;
    const agent = await this.agentsService.getAgentByUserId(userId);
    return { ok: true, agent };
  }

  @Patch('profile')
  @Roles('agent_de_sante')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      });
      return new HttpException({
        ok: false,
        error: 'Validation failed',
        details: messages,
      }, HttpStatus.BAD_REQUEST);
    },
  }))
  async updateMyProfile(@Body() updateAgentDto: UpdateAgentDto, @Req() req) {
    try {
      const userId = req.user.id;
      const agent = await this.agentsService.updateMyProfile(userId, updateAgentDto);
      return {
        ok: true,
        message: 'Profile updated successfully',
        agent,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Profile update failed',
        details: error.message,
      };
    }
  }
}
