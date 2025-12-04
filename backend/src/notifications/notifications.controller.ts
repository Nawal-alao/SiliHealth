import { Controller, Get, Patch, Param, UseGuards, Req, Body, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.findForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/view')
  async markViewed(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAsViewed(id, userId);
  }

  // Public endpoint to create a notification (internal use)
  @Post()
  async create(@Body() body: any) {
    // body: { userId, userRole, type, message, data }
    return this.notificationsService.createNotification(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  async markAllRead(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
