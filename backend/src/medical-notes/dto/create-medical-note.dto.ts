import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateMedicalNoteDto {
  @IsString()
  patientId: string;

  @IsString()
  agentId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsIn(['consultation', 'diagnostic', 'treatment', 'followup', 'other'])
  type: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean = false;
}

export class UpdateMedicalNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['consultation', 'diagnostic', 'treatment', 'followup', 'other'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
