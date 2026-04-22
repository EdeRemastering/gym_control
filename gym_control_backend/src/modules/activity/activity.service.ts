import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckinDto, CreateUserActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckin(gymId: string, dto: CreateCheckinDto) {
    await this.ensureUser(gymId, dto.userId);
    if (dto.validateBy) await this.ensureUser(gymId, dto.validateBy);
    return this.prisma.checkin.create({
      data: {
        gymId,
        userId: dto.userId,
        validateBy: dto.validateBy,
        type: dto.type ?? 'MANUAL',
      },
    });
  }

  listCheckins(gymId: string, userId?: string) {
    return this.prisma.checkin.findMany({
      where: { gymId, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async createUserActivity(gymId: string, dto: CreateUserActivityDto) {
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.userActivity.create({
      data: {
        gymId,
        userId: dto.userId,
        type: dto.type,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  listUserActivities(gymId: string, userId?: string) {
    return this.prisma.userActivity.findMany({
      where: { gymId, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  private async ensureUser(gymId: string, userId: string) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('User not found');
  }
}
