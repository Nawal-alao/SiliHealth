import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RolesGuard, Roles } from './roles.guard';

@Controller('api')
export class MeController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RolesGuard)
  @Roles('patient', 'agent_de_sante', 'admin')
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      return { ok: false, error: 'No user ID in token' };
    }

    return this.authService.me(userId);
  }
}
