import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async queueForSync(data: any, userId: string) {
    try {
      const queue = await this.prisma.syncQueue.create({
        data: {
          userId,
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action, // create, update, delete
          data: data.data || {},
          synced: false,
        },
      });

      return { ok: true, queue };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getPendingSync(userId: string) {
    try {
      const pending = await this.prisma.syncQueue.findMany({
        where: {
          userId,
          synced: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      return { ok: true, pending, totalPending: pending.length };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async executePendingSync(userId: string) {
    try {
      const pending = await this.prisma.syncQueue.findMany({
        where: {
          userId,
          synced: false,
        },
      });

      const results = [];
      for (const item of pending) {
        try {
          // Execute sync based on action and entityType
          switch (item.entityType) {
            case 'consultation':
              await this.syncConsultation(item);
              break;
            case 'appointment':
              await this.syncAppointment(item);
              break;
            case 'lab_result':
              await this.syncLabResult(item);
              break;
            default:
              break;
          }

          // Mark as synced
          await this.prisma.syncQueue.update({
            where: { id: item.id },
            data: {
              synced: true,
              syncedAt: new Date(),
            },
          });

          results.push({ id: item.id, status: 'synced' });
        } catch (error) {
          results.push({ id: item.id, status: 'error', error: error.message });
        }
      }

      return { ok: true, syncedCount: results.filter((r) => r.status === 'synced').length, results };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async markSynced(syncQueueId: string) {
    try {
      await this.prisma.syncQueue.update({
        where: { id: syncQueueId },
        data: {
          synced: true,
          syncedAt: new Date(),
        },
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  private async syncConsultation(item: any) {
    if (item.action === 'create') {
      // Create consultation
      await this.prisma.consultation.create({
        data: item.data,
      });
    } else if (item.action === 'update') {
      await this.prisma.consultation.update({
        where: { id: item.entityId },
        data: item.data,
      });
    } else if (item.action === 'delete') {
      await this.prisma.consultation.delete({
        where: { id: item.entityId },
      });
    }
  }

  private async syncAppointment(item: any) {
    if (item.action === 'create') {
      await this.prisma.appointment.create({
        data: item.data,
      });
    } else if (item.action === 'update') {
      await this.prisma.appointment.update({
        where: { id: item.entityId },
        data: item.data,
      });
    }
  }

  private async syncLabResult(item: any) {
    if (item.action === 'create') {
      await this.prisma.labResult.create({
        data: item.data,
      });
    }
  }
}
