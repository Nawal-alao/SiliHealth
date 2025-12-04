import { IsString, IsOptional, IsIn, IsBoolean, IsNumber } from 'class-validator';

export class CreateMedicalDocumentDto {
  @IsString()
  patientId: string;

  @IsString()
  agentId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['ordonnance', 'compte-rendu', 'radio', 'analyse', 'certificat', 'autre'])
  documentType: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean = false;
}

export class UpdateMedicalDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['ordonnance', 'compte-rendu', 'radio', 'analyse', 'certificat', 'autre'])
  documentType?: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;
}
