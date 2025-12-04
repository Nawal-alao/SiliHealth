import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('agent_de_sante')
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user.id);
  }

  @Get()
  findAll(@Query('agentId') agentId?: string, @Query('patientId') patientId?: string) {
    return this.appointmentsService.findAll(agentId, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('agent_de_sante')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles('agent_de_sante')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('date-range/:startDate/:endDate')
  findByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Query('agentId') agentId?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.appointmentsService.findByDateRange(start, end, agentId);
  }
}
