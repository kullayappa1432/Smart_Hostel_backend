import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(dto.user_id) } });
    if (!user) throw new NotFoundException('User not found');

    const notification = await this.prisma.notification.create({
      data: {
        user_id: BigInt(dto.user_id),
        title: dto.title,
        message: dto.message,
      },
    });

    return { message: 'Notification sent', data: notification };
  }

  async broadcast(dto: BroadcastNotificationDto) {
    const where: any = {};
    if (dto.role) where.role = dto.role;

    const users = await this.prisma.user.findMany({ where, select: { id: true } });

    const notifications = await this.prisma.notification.createMany({
      data: users.map((u) => ({
        user_id: u.id,
        title: dto.title,
        message: dto.message,
      })),
    });

    return {
      message: `Notification broadcast to ${notifications.count} users`,
      data: { count: notifications.count },
    };
  }

  async getMyNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
      message: 'Notifications fetched',
      data: { notifications, unreadCount },
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: BigInt(id), user_id: BigInt(userId) },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    const updated = await this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: { is_read: true },
    });

    return { message: 'Notification marked as read', data: updated };
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { user_id: BigInt(userId), is_read: false },
      data: { is_read: true },
    });

    return { message: 'All notifications marked as read' };
  }
}
