import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async findForUser(userId: string, limit = 50) {
    try{
      const notifs = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      const unread = await this.prisma.notification.count({ where: { userId, isRead: false } });
      return { ok: true, notifications: notifs, unreadCount: unread };
    }catch(e){
      // Defensive fallback: if DB/table not migrated yet, return empty list instead of 500
      this.logger.error('NotificationsService.findForUser error', (e as any)?.stack || e);
      return { ok: false, error: 'Notifications unavailable', notifications: [], unreadCount: 0 };
    }
  }

  async markAsViewed(id: string, userId: string) {
    try{
      const n = await this.prisma.notification.findUnique({ where: { id } });
      if (!n) throw new NotFoundException('Notification non trouvée');
      if (n.userId !== userId) throw new ForbiddenException('Accès non autorisé');

      const updated = await this.prisma.notification.update({ where: { id }, data: { isRead: true, viewedAt: new Date() } });
      return { ok: true, notification: updated };
    }catch(e){
      this.logger.error('NotificationsService.markAsViewed error', (e as any)?.stack || e);
      return { ok: false, error: 'Unable to mark notification', notification: null };
    }
  }

  async createNotification(payload: { userId: string; userRole: string; type: string; message: string; data?: any }){
    try{
      const { userId, userRole, type, message, data } = payload;
      const created = await this.prisma.notification.create({ data: { userId, userRole, type, message, data } });
      return { ok: true, notification: created };
    }catch(e){
      this.logger.error('NotificationsService.createNotification error', (e as any)?.stack || e);
      return { ok: false, error: 'Unable to create notification' };
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, viewedAt: new Date() }
      });
      return { ok: true };
    } catch (e) {
      this.logger.error('NotificationsService.markAllAsRead error', (e as any)?.stack || e);
      return { ok: false, error: 'Unable to mark all as read' };
    }
  }

  /**
   * Créer une notification pour un rendez-vous
   */
  async createAppointmentNotification(patientId: string, agentId: string, appointmentId: string, appointmentDate: Date, title: string) {
    try {
      // Notification pour le patient
      const patient = await this.prisma.patient.findUnique({ where: { patientId }, select: { userId: true } });
      if (patient) {
        await this.createNotification({
          userId: patient.userId,
          userRole: 'patient',
          type: 'appointment_reminder',
          message: `Rendez-vous programmé: ${title} le ${appointmentDate.toLocaleDateString('fr-FR')}`,
          data: { appointmentId, patientId, agentId, appointmentDate: appointmentDate.toISOString() }
        });
      }

      // Notification pour l'agent
      await this.createNotification({
        userId: agentId,
        userRole: 'agent_de_sante',
        type: 'appointment_created',
        message: `Nouveau rendez-vous: ${title} avec ${patient ? 'patient' : 'patient'} le ${appointmentDate.toLocaleDateString('fr-FR')}`,
        data: { appointmentId, patientId, agentId, appointmentDate: appointmentDate.toISOString() }
      });

      return { ok: true };
    } catch (e) {
      this.logger.error('NotificationsService.createAppointmentNotification error', (e as any)?.stack || e);
      return { ok: false };
    }
  }

  /**
   * Créer une notification pour un accès d'urgence
   */
  async createEmergencyAccessNotification(patientId: string, agentId: string, accessReason: string) {
    try {
      const patient = await this.prisma.patient.findUnique({ where: { patientId }, select: { userId: true, firstName: true, lastName: true } });
      if (patient) {
        await this.createNotification({
          userId: patient.userId,
          userRole: 'patient',
          type: 'emergency_access',
          message: `Accès d'urgence à votre dossier médical le ${new Date().toLocaleDateString('fr-FR')}. Raison: ${accessReason}`,
          data: { patientId, agentId, accessReason, accessedAt: new Date().toISOString() }
        });
      }
      return { ok: true };
    } catch (e) {
      this.logger.error('NotificationsService.createEmergencyAccessNotification error', (e as any)?.stack || e);
      return { ok: false };
    }
  }
}
