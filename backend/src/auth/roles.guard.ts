import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // No role restrictions
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Check if user has required role
      if (!requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }

      // Attach user info to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ForbiddenException('Token expired');
      }
      throw error;
    }
  }
}

// Decorator for role-based authorization
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Permission check functions
export class PermissionService {
  static canAccessPatientData(userRole: string, userId: string, patientUserId?: string): boolean {
    if (userRole === 'agent_de_sante') {
      return true; // Agents can access any patient data
    }

    if (userRole === 'patient' && patientUserId) {
      return userId === patientUserId; // Patients can only access their own data
    }

    return false;
  }

  static canCreateConsultation(userRole: string): boolean {
    return userRole === 'agent_de_sante';
  }

  static canUpdatePatientData(userRole: string, userId: string, patientUserId: string): boolean {
    if (userRole === 'agent_de_sante') {
      return true; // Agents can update any patient data
    }

    if (userRole === 'patient') {
      return userId === patientUserId; // Patients can only update their own basic info
    }

    return false;
  }
}
