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
} from '@nestjs/common';
import { MedicalNotesService } from './medical-notes.service';
import { CreateMedicalNoteDto, UpdateMedicalNoteDto } from './dto/create-medical-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('medical-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalNotesController {
  constructor(private readonly medicalNotesService: MedicalNotesService) {}

  @Post()
  @Roles('agent_de_sante')
  create(@Body() createMedicalNoteDto: CreateMedicalNoteDto) {
    return this.medicalNotesService.create(createMedicalNoteDto);
  }

  @Get()
  findAll(@Query('patientId') patientId?: string, @Query('agentId') agentId?: string) {
    return this.medicalNotesService.findAll(patientId, agentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles('agent_de_sante')
  update(@Param('id') id: string, @Body() updateMedicalNoteDto: UpdateMedicalNoteDto) {
    return this.medicalNotesService.update(id, updateMedicalNoteDto);
  }

  @Delete(':id')
  @Roles('agent_de_sante')
  remove(@Param('id') id: string) {
    return this.medicalNotesService.remove(id);
  }
}
