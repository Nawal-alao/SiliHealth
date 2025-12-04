import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsUUID } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  appointmentId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsEnum(['completed', 'pending', 'cancelled'])
  status?: string = 'completed';

  @IsOptional()
  @IsNumber()
  duration?: number = 30;
}
