import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from '../auth/dto/patient.dto';

@Controller('api/patients')
@UseGuards(RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Roles('agent_de_sante')
  @Get()
  async getAllPatients(@Req() req) {
    const userId = req.user.id;
    const patients = await this.patientsService.getAllPatients(userId);
    return {
      ok: true,
      patients,
      total: patients.length
    };
  }

  @Roles('patient')
  @Get('profile')
  async getMyProfile(@Req() req) {
    const userId = req.user.id;
    const patient = await this.patientsService.getPatientByUserId(userId);
    return { ok: true, patient };
  }

  @Roles('patient')
  @Put('profile')
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
        details: messages
      }, HttpStatus.BAD_REQUEST);
    }
  }))
  async updateMyProfile(@Body() updatePatientDto: UpdatePatientDto, @Req() req) {
    try {
      const userId = req.user.id;
      const patient = await this.patientsService.updateMyProfile(userId, updatePatientDto);
      return {
        ok: true,
        message: 'Profile updated successfully',
        patient
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Profile update failed',
        details: error.message
      };
    }
  }

  @Roles('agent_de_sante')
  @Get('summary/:patientId')
  async getPatientSummary(@Param('patientId') patientId: string, @Req() req) {
    const userId = req.user.id;
    const patient = await this.patientsService.getPatientSummary(patientId, userId);
    return { ok: true, patient };
  }

  @Roles('agent_de_sante', 'patient')
  @Get(':patientId')
  async getPatient(@Param('patientId') patientId: string, @Req() req) {
    const userId = req.user.id;
    const patient = await this.patientsService.getPatient(patientId, userId);
    return { ok: true, patient };
  }

  @Roles('patient')
  @Post()
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
        details: messages
      }, HttpStatus.BAD_REQUEST);
    }
  }))
  async createPatient(@Body() createPatientDto: CreatePatientDto, @Req() req) {
    try {
      const userId = req.user.id;
      const patient = await this.patientsService.createPatient(createPatientDto, userId);
      return {
        ok: true,
        message: 'Patient record created successfully',
        patient
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Patient creation failed',
        details: error.message
      };
    }
  }

  @Roles('agent_de_sante', 'patient')
  @Put(':patientId')
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
        details: messages
      }, HttpStatus.BAD_REQUEST);
    }
  }))
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req
  ) {
    try {
      const userId = req.user.id;
      const patient = await this.patientsService.updatePatient(patientId, updatePatientDto, userId);
      return {
        ok: true,
        message: 'Patient record updated successfully',
        patient
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        ok: false,
        error: 'Patient update failed',
        details: error.message
      };
    }
  }
}
