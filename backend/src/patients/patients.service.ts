import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponseDto,
  PatientSummaryDto
} from '../auth/dto/patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private prisma: PrismaService) {}

  async createPatient(createPatientDto: CreatePatientDto, userId: string): Promise<PatientResponseDto> {
    // Vérifier que l'utilisateur existe et est un patient
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'patient') {
      throw new ForbiddenException('Only patients can create patient records');
    }

    // Vérifier si un dossier patient existe déjà
    const existingPatient = await this.prisma.patient.findUnique({
      where: { userId }
    });

    if (existingPatient) {
      throw new BadRequestException('Patient record already exists for this user');
    }

    // Valider le consentement
    if (!createPatientDto.consentForDataProcessing) {
      throw new BadRequestException('Consent for data processing is required');
    }

    // Calculer automatiquement le BMI si taille et poids fournis
    let bmi: number | undefined;
    // BMI calculation will be done when measurements are provided via updates

    // Valider les champs spécifiques au sexe
    this.validateSexSpecificFields(createPatientDto);

    try {
      const patient = await this.prisma.patient.create({
        data: {
          userId,
          firstName: createPatientDto.firstName,
          lastName: createPatientDto.lastName,
          displayName: createPatientDto.displayName,
          birthDate: new Date(createPatientDto.birthDate),
          sexAtBirth: createPatientDto.sexAtBirth,
          genderIdentity: createPatientDto.genderIdentity,
          nationalIdNumber: createPatientDto.nationalIdNumber,
          email: createPatientDto.email,
          phone: createPatientDto.phone,
          menarcheAge: createPatientDto.menarcheAge,
          menstrualCycleRegular: createPatientDto.menstrualCycleRegular,
          menstrualCycleLength: createPatientDto.menstrualCycleLength,
          pregnantCurrent: createPatientDto.pregnantCurrent,
          // heightCm: createPatientDto.heightCm, // Available via updates
          // weightKg: createPatientDto.weightKg, // Available via updates
          // bmi, // Calculated from height/weight
          consentForDataProcessing: createPatientDto.consentForDataProcessing,
          shareWithResearch: createPatientDto.shareWithResearch || false,
          createdByUserId: userId
        }
      });

      // Log de création
      await this.prisma.activityLog.create({
        data: {
          actorUserId: userId,
          action: 'patient_record_created',
          targetPatientId: patient.patientId,
          details: 'Patient medical record created'
        }
      });

      return {
        patientId: patient.patientId,
        userId: patient.userId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        displayName: patient.displayName,
        birthDate: patient.birthDate.toISOString().split('T')[0],
        sexAtBirth: patient.sexAtBirth,
        genderIdentity: patient.genderIdentity,
        email: patient.email,
        phone: patient.phone,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt?.toISOString()
      };
    } catch (error) {
      throw new BadRequestException('Failed to create patient record: ' + error.message);
    }
  }

  async updatePatient(patientId: string, updatePatientDto: UpdatePatientDto, userId: string): Promise<PatientResponseDto> {
    // Trouver le patient
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      include: { user: true }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Vérifier les permissions
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    // Agents peuvent modifier tous les dossiers, patients seulement le leur
    if (requestingUser.role !== 'agent_de_sante' && patient.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Valider les champs spécifiques au sexe
    const fullDto = { ...updatePatientDto, sexAtBirth: patient.sexAtBirth };
    this.validateSexSpecificFields(fullDto);

    // Calculer BMI si taille/poids modifiés
    let bmi = patient.bmi;
    if ((updatePatientDto.heightCm || patient.heightCm) && (updatePatientDto.weightKg || patient.weightKg)) {
      const heightM = (updatePatientDto.heightCm || patient.heightCm!) / 100;
      const weight = updatePatientDto.weightKg || patient.weightKg!;
      bmi = Math.round((weight / (heightM * heightM)) * 100) / 100;
    }

    try {
      const updatedPatient = await this.prisma.patient.update({
        where: { patientId },
        data: {
          ...updatePatientDto,
          bmi,
          modifiedByUserId: userId,
          modifiedAt: new Date()
        }
      });

      // Log de modification
      await this.prisma.activityLog.create({
        data: {
          actorUserId: userId,
          action: 'patient_record_updated',
          targetPatientId: patientId,
          details: 'Patient medical record updated'
        }
      });

      return {
        patientId: updatedPatient.patientId,
        userId: updatedPatient.userId,
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        displayName: updatedPatient.displayName,
        birthDate: updatedPatient.birthDate.toISOString().split('T')[0],
        sexAtBirth: updatedPatient.sexAtBirth,
        genderIdentity: updatedPatient.genderIdentity,
        email: updatedPatient.email,
        phone: updatedPatient.phone,
        createdAt: updatedPatient.createdAt.toISOString(),
        updatedAt: updatedPatient.updatedAt?.toISOString()
      };
    } catch (error) {
      throw new BadRequestException('Failed to update patient record: ' + error.message);
    }
  }

  async getPatient(patientId: string, requestingUserId: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { patientId },
      include: { user: true }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Vérifier les permissions
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId }
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    // Agents peuvent voir tous les dossiers, patients seulement le leur
    if (requestingUser.role !== 'agent_de_sante' && patient.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      patientId: patient.patientId,
      userId: patient.userId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      displayName: patient.displayName,
      birthDate: patient.birthDate.toISOString().split('T')[0],
      sexAtBirth: patient.sexAtBirth,
      genderIdentity: patient.genderIdentity,
      email: patient.email,
      phone: patient.phone,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt?.toISOString()
    };
  }

  async getPatientSummary(patientId: string, requestingUserId: string): Promise<PatientSummaryDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { patientId }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Vérifier les permissions (même logique)
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId }
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    if (requestingUser.role !== 'agent_de_sante' && patient.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      displayName: patient.displayName,
      birthDate: patient.birthDate.toISOString().split('T')[0],
      sexAtBirth: patient.sexAtBirth,
      phone: patient.phone,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone
    };
  }

  async getAllPatients(requestingUserId: string): Promise<PatientSummaryDto[]> {
    // Seulement les agents peuvent lister tous les patients
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId }
    });

    if (!requestingUser || requestingUser.role !== 'agent_de_sante') {
      throw new ForbiddenException('Only healthcare agents can list all patients');
    }

    const patients = await this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return patients.map(patient => ({
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      displayName: patient.displayName,
      birthDate: patient.birthDate.toISOString().split('T')[0],
      sexAtBirth: patient.sexAtBirth,
      phone: patient.phone,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone
    }));
  }

  async getPatientByUserId(userId: string): Promise<any> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient record not found');
    }

    return patient;
  }

  async updateMyProfile(userId: string, updatePatientDto: UpdatePatientDto): Promise<any> {
    // Vérifier que le patient existe
    const existingPatient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!existingPatient) {
      throw new NotFoundException('Patient record not found');
    }

    // Empêcher la modification du sexe et de la date de naissance
    if (updatePatientDto.sexAtBirth !== undefined && updatePatientDto.sexAtBirth !== existingPatient.sexAtBirth) {
      throw new BadRequestException('Sex at birth cannot be modified');
    }

    if (updatePatientDto.birthDate !== undefined && updatePatientDto.birthDate !== existingPatient.birthDate.toISOString().split('T')[0]) {
      throw new BadRequestException('Birth date cannot be modified');
    }

    // Valider les champs spécifiques au sexe
    const dtoWithSex = { ...updatePatientDto, sexAtBirth: existingPatient.sexAtBirth };
    this.validateSexSpecificFields(dtoWithSex);

    // Calculer automatiquement le BMI si taille et poids modifiés
    let bmi: number | undefined;
    const height = updatePatientDto.heightCm || existingPatient.heightCm;
    const weight = updatePatientDto.weightKg || existingPatient.weightKg;

    if (height && weight) {
      bmi = Math.round((weight / Math.pow(height / 100, 2)) * 100) / 100;
    }

    try {
      const patient = await this.prisma.patient.update({
        where: { userId },
        data: {
          ...updatePatientDto,
          bmi,
          updatedAt: new Date(),
          modifiedByUserId: userId,
        },
      });

      return patient;
    } catch (error) {
      throw new BadRequestException('Failed to update patient profile');
    }
  }

  private validateSexSpecificFields(dto: any): void {
    const sex = dto.sexAtBirth;

    // Champs réservés aux femmes
    if (sex !== 'F') {
      const femaleFields = [
        'menarcheAge', 'menstrualCycleRegular', 'menstrualCycleLength',
        'contraception', 'pregnantCurrent', 'pregnancyDetails', 'gynecologicalHistory'
      ];

      for (const field of femaleFields) {
        if (dto[field] !== undefined) {
          throw new BadRequestException(`Field ${field} is only allowed for female patients`);
        }
      }
    }

    // Champs réservés aux hommes
    if (sex !== 'M') {
      const maleFields = ['urologicalHistory', 'testicularExamNotes'];

      for (const field of maleFields) {
        if (dto[field] !== undefined) {
          throw new BadRequestException(`Field ${field} is only allowed for male patients`);
        }
      }
    }

    // Validations spécifiques aux femmes
    if (sex === 'F') {
      if (dto.pregnantCurrent && !dto.pregnancyDetails) {
        // Ne pas exiger les détails de grossesse, mais avertir
        this.logger.warn('Pregnancy indicated but no pregnancy details provided');
      }
    }
  }
}
