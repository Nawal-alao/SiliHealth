import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  patientId: string;

  @IsString()
  agentId: string;

  @IsString()
  medication: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'stopped'])
  status?: string = 'active';
}

export class UpdateTreatmentDto {
  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'stopped'])
  status?: string;
}
