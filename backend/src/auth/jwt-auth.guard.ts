import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization || req.raw?.headers?.authorization;
    if(!auth) throw new UnauthorizedException('No authorization header');
    const parts = auth.split(' ');
    if(parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException('Malformed token');
    const token = parts[1];
    try{
      const payload: any = jwt.verify(token, JWT_SECRET);
      // attach user to request
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if(!user) throw new UnauthorizedException('User not found');
      req.user = { id: user.id, email: user.email, role: user.role };
      return true;
    }catch(e){
      throw new UnauthorizedException('Invalid token');
    }
  }
}
