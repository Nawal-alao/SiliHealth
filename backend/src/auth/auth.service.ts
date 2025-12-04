import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(data: any) {
    // Convert legacy role values
    let role = data.role;
    if (role === 'doctor') {
      role = 'agent_de_sante';
    }

    // Validate role is strictly patient or agent_de_sante
    if (!['patient', 'agent_de_sante'].includes(role)) {
      throw new BadRequestException('Role must be either "patient" or "agent_de_sante"');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true }
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: role,
        }
      });

      let responseData: any = {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role: role,
          createdAt: user.createdAt
        }
      };

      // Handle name fields (support both fullname and firstName/lastName)
      let firstName: string;
      let lastName: string;

      if (data.firstName && data.lastName) {
        firstName = data.firstName;
        lastName = data.lastName;
      } else if (data.fullname) {
        // Split fullname into first and last name
        const nameParts = data.fullname.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        throw new BadRequestException('Name is required (fullname or firstName/lastName)');
      }

      // Create patient or agent record based on role
      if (role === 'patient') {
        // Validate patient-specific fields
        if (!data.sexAtBirth) {
          throw new BadRequestException('Sex at birth is required for patient registration');
        }

        if (!data.birthDate) {
          throw new BadRequestException('Birth date is required for patient registration');
        }

        if (!data.consentForDataProcessing) {
          throw new BadRequestException('Consent for data processing is required for patients');
        }

        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            firstName: firstName,
            lastName: lastName,
            birthDate: new Date(data.birthDate),
            sexAtBirth: data.sexAtBirth,
            email: data.email,
            phone: data.phone,
            addressLine1: data.addressLine1,
            city: data.city,
            postalCode: data.postalCode,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            consentForDataProcessing: data.consentForDataProcessing || false,
            shareWithResearch: data.shareWithResearch || false,
            createdByUserId: user.id
          }
        });

        responseData.patientId = patient.patientId;
        responseData.patient = {
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          sexAtBirth: patient.sexAtBirth,
          birthDate: patient.birthDate.toISOString().split('T')[0]
        };
      } else if (role === 'agent_de_sante') {
        const agent = await tx.agent.create({
          data: {
            userId: user.id,
            licenseNumber: data.licenseNumber,
            specialty: data.specialty,
            phone: data.phone,
            department: data.department,
          }
        });

        responseData.agent = {
          fullname: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          licenseNumber: agent.licenseNumber,
          specialty: agent.specialty,
          department: agent.department
        };
      }

      // Log the registration
      await tx.activityLog.create({
        data: {
          actorUserId: user.id,
          action: 'user_registration',
          details: `New ${role} account created`,
        }
      });

      return responseData;
    });

    return result;
  }

  async login(data: any) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: {
        patient: data.role === 'patient',
        agent: data.role === 'agent_de_sante'
      }
    });

    if (!user || !user.isActive) {
      return { ok: false, error: 'Invalid credentials' };
    }

    if (!user.password) {
      return { ok: false, error: 'No password set' };
    }

    // Verify password
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      // Log failed login attempt
      await this.prisma.activityLog.create({
        data: {
          actorUserId: user.id,
          action: 'login_failed',
          details: 'Invalid password attempt',
        }
      });

      return { ok: false, error: 'Invalid credentials' };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log successful login
    await this.prisma.activityLog.create({
      data: {
        actorUserId: user.id,
        action: 'login_success',
        details: 'User logged in successfully',
      }
    });

    // Prepare response data
    const response: any = {
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };

    // Include role-specific data
    if (user.role === 'patient' && user.patient) {
      response.patient = {
        patientId: user.patient.patientId,
        fullname: `${user.patient.firstName} ${user.patient.lastName}`,
        sex: user.patient.sexAtBirth
      };
    } else if (user.role === 'agent_de_sante' && user.agent) {
      response.agent = {
        specialty: user.agent.specialty,
        department: user.agent.department
      };
    }

    // Try to attach latest uploaded avatar for the user (if any)
    try{
      const latest = await this.prisma.upload.findFirst({ where: { uploadedBy: user.id }, orderBy: { createdAt: 'desc' } });
      if(latest && latest.path){
        response.user.avatarUrl = latest.path;
        // also attach to patient or agent part if present
        if(response.patient) response.patient.avatarUrl = latest.path;
        if(response.agent) response.agent.avatarUrl = latest.path;
      }
    }catch(e){ /* ignore */ }

    return response;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        agent: true
      }
    });

    if (!user) {
      return { ok: false, error: 'User not found' };
    }

    // Try to fetch latest uploaded avatar for this user
    let avatarUrl: string | null = null;
    try{
      const latest = await this.prisma.upload.findFirst({ where: { uploadedBy: userId }, orderBy: { createdAt: 'desc' } });
      if(latest && latest.path) avatarUrl = latest.path;
    }catch(e){ /* ignore */ }

    const resp: any = {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        isActive: user.isActive
      },
      patient: user.patient,
      agent: user.agent
    };

    if(avatarUrl){
      resp.user.avatarUrl = avatarUrl;
      if(resp.patient) resp.patient.avatarUrl = avatarUrl;
      if(resp.agent) resp.agent.avatarUrl = avatarUrl;
    }

    return resp;
  }
}
