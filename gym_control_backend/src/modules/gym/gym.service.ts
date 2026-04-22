import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';

/**
 * GymService
 * Gym management and multi-tenancy operations
 */
@Injectable()
export class GymService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly gymSelect = {
    id: true,
    name: true,
    address: true,
    phone: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(dto: CreateGymDto) {
    return this.prisma.gym.create({
      data: dto,
      select: this.gymSelect,
    });
  }

  async findAll() {
    return this.prisma.gym.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: this.gymSelect,
      take: 100,
    });
  }

  async findOne(id: string) {
    const gym = await this.prisma.gym.findFirst({
      where: { id, deletedAt: null },
      select: this.gymSelect,
    });
    if (!gym) {
      throw new NotFoundException('Gym not found');
    }
    return gym;
  }

  async update(id: string, dto: UpdateGymDto) {
    await this.ensureExists(id);
    return this.prisma.gym.update({
      where: { id },
      data: dto,
      select: this.gymSelect,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.gym.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const gym = await this.prisma.gym.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!gym) {
      throw new NotFoundException('Gym not found');
    }
  }
}
