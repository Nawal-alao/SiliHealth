import { IsEmail, IsIn, IsOptional, IsString, MinLength, IsDateString, Matches, IsBoolean, ValidateIf } from 'class-validator';

export class SignupDto {
  // Support both fullname (legacy) and firstName/lastName (new)
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ\s-]{1,100}$/, {
    message: 'First name must contain only letters, spaces, and hyphens'
  })
  firstName: string;

  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ\s-]{1,100}$/, {
    message: 'Last name must contain only letters, spaces, and hyphens'
  })
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  })
  password: string;

  @IsString()
  @IsIn(['patient', 'agent_de_sante', 'doctor'], {
    message: 'Role must be either "patient", "agent_de_sante", or "doctor"'
  })
  role: string;

  // Patient-specific fields (required when role is 'patient')
  @ValidateIf(o => o.role === 'patient')
  @IsString()
  @IsIn(['M', 'F', 'Other'], {
    message: 'Sex at birth must be "M", "F", or "Other" when registering as patient'
  })
  sexAtBirth?: string;

  @ValidateIf(o => o.role === 'patient')
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birth date must be in YYYY-MM-DD format'
  })
  birthDate?: string;

  // Consentement obligatoire pour les patients uniquement
  @ValidateIf(o => o.role === 'patient')
  @IsBoolean()
  consentForDataProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  shareWithResearch?: boolean;

  // Patient-specific fields (required when role is 'patient')
  @IsOptional()
  @IsString()
  @IsIn(['H', 'F', 'Autre'], {
    message: 'Sex must be "H", "F", or "Autre" when provided'
  })
  sex?: string;

  @IsOptional()
  @IsDateString({}, {
    message: 'Date of birth must be a valid date string (ISO format)'
  })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  // Agent-specific fields (optional for agents)
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  department?: string;
}
