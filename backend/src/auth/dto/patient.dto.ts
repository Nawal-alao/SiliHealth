import {
  IsOptional, IsString, IsDateString, IsIn, IsBoolean,
  IsNumber, Min, Max, IsEmail, Matches, IsObject, ValidateIf,
  IsArray, ArrayNotEmpty
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Validation helpers
function IsPastDate() {
  return (object: any, propertyName: string) => {
    return (target: any, propertyKey: string) => {
      // Custom validation decorator would go here
    };
  };
}

export class CreatePatientDto {
  // Identification obligatoire
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

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsDateString({}, {
    message: 'Birth date must be a valid date string (ISO format)'
  })
  @Transform(({ value }) => {
    const date = new Date(value);
    if (date > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }
    if (date < new Date('1900-01-01')) {
      throw new Error('Birth date seems too old');
    }
    return value;
  })
  birthDate: string;

  @IsString()
  @IsIn(['M', 'F', 'Other'], {
    message: 'Sex at birth must be "M", "F", or "Other"'
  })
  sexAtBirth: string;

  @IsOptional()
  @IsString()
  genderIdentity?: string;

  @IsOptional()
  @IsString()
  nationalIdNumber?: string;

  // Contact optionnel
  @IsOptional()
  @IsEmail({}, {
    message: 'Email must be a valid email address'
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
    message: 'Phone must be a valid French phone number'
  })
  phone?: string;

  // Champs conditionnels selon le sexe
  @ValidateIf(o => o.sexAtBirth === 'F')
  @IsOptional()
  @IsNumber()
  @Min(8, { message: 'Menarche age must be at least 8' })
  @Max(18, { message: 'Menarche age must be at most 18' })
  menarcheAge?: number;

  @ValidateIf(o => o.sexAtBirth === 'F')
  @IsOptional()
  @IsBoolean()
  menstrualCycleRegular?: boolean;

  @ValidateIf(o => o.sexAtBirth === 'F')
  @IsOptional()
  @IsNumber()
  @Min(21, { message: 'Menstrual cycle length must be at least 21 days' })
  @Max(35, { message: 'Menstrual cycle length must be at most 35 days' })
  menstrualCycleLength?: number;

  @ValidateIf(o => o.sexAtBirth === 'F')
  @IsOptional()
  @IsBoolean()
  pregnantCurrent?: boolean;

  // Consentement obligatoire
  @IsBoolean()
  consentForDataProcessing: boolean;

  @IsOptional()
  @IsBoolean()
  shareWithResearch?: boolean;
}

export class UpdatePatientDto {
  // Identification optionnelle pour updates
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ\s-]{1,100}$/, {
    message: 'First name must contain only letters, spaces, and hyphens'
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ\s-]{1,100}$/, {
    message: 'Last name must contain only letters, spaces, and hyphens'
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsDateString({}, {
    message: 'Birth date must be a valid date string (ISO format)'
  })
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['M', 'F', 'Other'], {
    message: 'Sex at birth must be "M", "F", or "Other"'
  })
  sexAtBirth?: string;

  @IsOptional()
  @IsEmail({}, {
    message: 'Email must be a valid email address'
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
    message: 'Phone must be a valid French phone number'
  })
  phone?: string;

  // Contact & adresse
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, {
    message: 'Postal code must be 5 digits'
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+33|0)[1-9](\d{2}){4}$/, {
    message: 'Emergency contact phone must be a valid French phone number'
  })
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  relationshipToPatient?: string;

  // Statut socio-démographique
  @IsOptional()
  @IsString()
  @IsIn(['single', 'married', 'divorced', 'widowed', 'other'])
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string;

  @IsOptional()
  @IsString()
  @IsIn(['never', 'former', 'current'])
  smokingStatus?: string;

  @IsOptional()
  @IsString()
  @IsIn(['none', 'social', 'moderate', 'high'])
  alcoholUse?: string;

  // Mesures & signes vitaux
  @IsOptional()
  @IsNumber()
  @Min(50, { message: 'Height must be at least 50cm' })
  @Max(250, { message: 'Height must be at most 250cm' })
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(2, { message: 'Weight must be at least 2kg' })
  @Max(300, { message: 'Weight must be at most 300kg' })
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(80, { message: 'Systolic blood pressure seems too low' })
  @Max(250, { message: 'Systolic blood pressure seems too high' })
  bloodPressureSystolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(50, { message: 'Diastolic blood pressure seems too low' })
  @Max(150, { message: 'Diastolic blood pressure seems too high' })
  bloodPressureDiastolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(40, { message: 'Heart rate seems too low' })
  @Max(200, { message: 'Heart rate seems too high' })
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(30, { message: 'Temperature seems too low' })
  @Max(45, { message: 'Temperature seems too high' })
  temperatureC?: number;

  // Champs JSONB - validation basique
  @IsOptional()
  @IsObject()
  chronicConditions?: any;

  @IsOptional()
  @IsObject()
  surgeries?: any;

  @IsOptional()
  @IsObject()
  familyHistory?: any;

  @IsOptional()
  @IsObject()
  allergies?: any;

  @IsOptional()
  @IsObject()
  currentMedications?: any;

  @IsOptional()
  @IsObject()
  vaccinations?: any;

  @IsOptional()
  @IsObject()
  labResults?: any;

  @IsOptional()
  @IsObject()
  imaging?: any;

  // Champs spécifiques femmes (validation conditionnelle)
  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsNumber()
  @Min(8, { message: 'Menarche age must be at least 8' })
  @Max(18, { message: 'Menarche age must be at most 18' })
  menarcheAge?: number;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsBoolean()
  menstrualCycleRegular?: boolean;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsNumber()
  @Min(21, { message: 'Menstrual cycle length must be at least 21 days' })
  @Max(35, { message: 'Menstrual cycle length must be at most 35 days' })
  menstrualCycleLength?: number;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsObject()
  contraception?: any;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsBoolean()
  pregnantCurrent?: boolean;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsObject()
  pregnancyDetails?: any;

  @ValidateIf(o => o.sexAtBirth === 'F' || !o.sexAtBirth)
  @IsOptional()
  @IsObject()
  gynecologicalHistory?: any;

  // Champs spécifiques hommes
  @ValidateIf(o => o.sexAtBirth === 'M')
  @IsOptional()
  @IsObject()
  urologicalHistory?: any;

  @ValidateIf(o => o.sexAtBirth === 'M')
  @IsOptional()
  @IsString()
  testicularExamNotes?: string;

  // Santé mentale
  @IsOptional()
  @IsObject()
  mentalHealthConditions?: any;

  @IsOptional()
  @IsBoolean()
  currentTherapy?: boolean;

  @IsOptional()
  @IsBoolean()
  suicidalIdeationScreened?: boolean;

  // Assurance
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  // Consentements
  @IsOptional()
  @IsBoolean()
  consentForDataProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  shareWithResearch?: boolean;
}

// DTO pour les réponses API
export class PatientResponseDto {
  patientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  birthDate: string;
  sexAtBirth: string;
  genderIdentity?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export class PatientSummaryDto {
  patientId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  birthDate: string;
  sexAtBirth: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
