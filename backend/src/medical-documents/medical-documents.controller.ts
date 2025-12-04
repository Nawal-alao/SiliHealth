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
import { MedicalDocumentsService } from './medical-documents.service';
import { CreateMedicalDocumentDto, UpdateMedicalDocumentDto } from './dto/create-medical-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('medical-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalDocumentsController {
  constructor(private readonly medicalDocumentsService: MedicalDocumentsService) {}

  @Post()
  @Roles('agent_de_sante')
  create(@Body() createMedicalDocumentDto: CreateMedicalDocumentDto) {
    return this.medicalDocumentsService.create(createMedicalDocumentDto);
  }

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('agentId') agentId?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.medicalDocumentsService.findAll(patientId, agentId, documentType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalDocumentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('agent_de_sante')
  update(@Param('id') id: string, @Body() updateMedicalDocumentDto: UpdateMedicalDocumentDto) {
    return this.medicalDocumentsService.update(id, updateMedicalDocumentDto);
  }

  @Delete(':id')
  @Roles('agent_de_sante')
  remove(@Param('id') id: string) {
    return this.medicalDocumentsService.remove(id);
  }
}
