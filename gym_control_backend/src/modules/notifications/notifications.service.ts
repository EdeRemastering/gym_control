import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateNotificationDto,
  MarkNotificationAsReadDto,
  UpsertNotificationPreferencesDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(gymId: string, dto: CreateNotificationDto) {
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.notification.create({
      data: {
        gymId,
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data as Prisma.InputJsonValue | undefined,
      },
      select: this.notificationSelect,
    });
  }

  async list(gymId: string, userId?: string, onlyUnread?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        gymId,
        ...(userId ? { userId } : {}),
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: this.notificationSelect,
      take: 200,
    });
  }

  async updateReadStatus(
    gymId: string,
    notificationId: string,
    dto: MarkNotificationAsReadDto,
  ) {
    await this.ensureNotification(gymId, notificationId);
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: dto.isRead },
      select: this.notificationSelect,
    });
  }

  async upsertPreferences(
    gymId: string,
    userId: string,
    dto: UpsertNotificationPreferencesDto,
  ) {
    await this.ensureUser(gymId, userId);
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_gymId: { userId, gymId },
      },
      create: {
        userId,
        gymId,
        emailEnabled: dto.emailEnabled ?? true,
        pushEnabled: dto.pushEnabled ?? true,
        smsEnabled: dto.smsEnabled ?? false,
      },
      update: {
        ...(dto.emailEnabled !== undefined
          ? { emailEnabled: dto.emailEnabled }
          : {}),
        ...(dto.pushEnabled !== undefined
          ? { pushEnabled: dto.pushEnabled }
          : {}),
        ...(dto.smsEnabled !== undefined ? { smsEnabled: dto.smsEnabled } : {}),
      },
      select: this.preferenceSelect,
    });
  }

  async getPreferences(gymId: string, userId: string) {
    await this.ensureUser(gymId, userId);
    return this.prisma.notificationPreference.findUnique({
      where: {
        userId_gymId: { userId, gymId },
      },
      select: this.preferenceSelect,
    });
  }

  private async ensureUser(gymId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureNotification(gymId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, gymId },
      select: { id: true },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
  }

  private readonly notificationSelect = {
    id: true,
    gymId: true,
    userId: true,
    type: true,
    title: true,
    message: true,
    data: true,
    isRead: true,
    createdAt: true,
  };

  private readonly preferenceSelect = {
    id: true,
    userId: true,
    gymId: true,
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: true,
    createdAt: true,
    updatedAt: true,
  };
}
