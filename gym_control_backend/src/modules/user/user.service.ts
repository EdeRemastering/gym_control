import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * UserService
 * User business logic and database operations
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    gymId: true,
    name: true,
    email: true,
    phone: true,
    bio: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(gymId: string, dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        gymId,
        ...dto,
      },
      select: this.userSelect,
    });
  }

  async findAll(gymId: string, search?: string) {
    return this.prisma.user.findMany({
      where: {
        gymId,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: this.userSelect,
    });
  }

  async findOne(gymId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, gymId, deletedAt: null },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(gymId: string, id: string, dto: UpdateUserDto) {
    await this.ensureExists(gymId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.userSelect,
    });
  }

  async remove(gymId: string, id: string) {
    await this.ensureExists(gymId, id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, gymId: true, deletedAt: true },
    });
  }

  async findAllAuthorized(
    gymId: string,
    authzWhere: Record<string, unknown>,
    search?: string,
  ) {
    return this.prisma.user.findMany({
      where: {
        ...authzWhere,
        gymId,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: this.userSelect,
    });
  }

  private async ensureExists(gymId: string, id: string): Promise<void> {
    const exists = await this.prisma.user.findFirst({
      where: { id, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }
}
