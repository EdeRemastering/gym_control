import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddRoutineExerciseDto,
  AssignRoutineDto,
  CreateExerciseDto,
  CreateProgressDto,
  CreateRoutineDto,
} from './dto/training.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  createRoutine(gymId: string, dto: CreateRoutineDto) {
    return this.prisma.routine.create({ data: { gymId, ...dto } });
  }
  listRoutines(gymId: string) {
    return this.prisma.routine.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  createExercise(gymId: string, dto: CreateExerciseDto) {
    return this.prisma.exercise.create({ data: { gymId, ...dto } });
  }
  listExercises(gymId: string) {
    return this.prisma.exercise.findMany({
      where: { gymId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  async addRoutineExercise(gymId: string, dto: AddRoutineExerciseDto) {
    await this.ensureRoutine(gymId, dto.routineId);
    await this.ensureExercise(gymId, dto.exerciseId);
    return this.prisma.routineExercise.create({ data: { gymId, ...dto } });
  }
  async listRoutineExercises(gymId: string, routineId: string) {
    await this.ensureRoutine(gymId, routineId);
    return this.prisma.routineExercise.findMany({
      where: { gymId, routineId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      take: 300,
    });
  }
  async assignRoutine(gymId: string, dto: AssignRoutineDto) {
    await this.ensureRoutine(gymId, dto.routineId);
    await this.ensureUser(gymId, dto.userId);
    if (dto.assignedBy) await this.ensureUser(gymId, dto.assignedBy);
    return this.prisma.userRoutine.create({
      data: {
        gymId,
        userId: dto.userId,
        routineId: dto.routineId,
        assignedBy: dto.assignedBy,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }
  async listUserRoutines(gymId: string, userId: string) {
    await this.ensureUser(gymId, userId);
    return this.prisma.userRoutine.findMany({
      where: { gymId, userId, deletedAt: null },
      include: {
        routine: {
          select: {
            id: true,
            name: true,
            exercises: {
              select: {
                id: true,
                reps: true,
                weight: true,
                exercise: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 120,
    });
  }
  async createProgress(gymId: string, dto: CreateProgressDto) {
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.progress.create({
      data: {
        gymId,
        userId: dto.userId,
        weight: dto.weight,
        bodyFat: dto.bodyFat,
        muscle: dto.muscle,
        measuredAt: new Date(dto.measuredAt),
      },
    });
  }

  private async ensureRoutine(gymId: string, routineId: string) {
    const row = await this.prisma.routine.findFirst({
      where: { id: routineId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Routine not found');
  }
  private async ensureExercise(gymId: string, exerciseId: string) {
    const row = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Exercise not found');
  }
  private async ensureUser(gymId: string, userId: string) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('User not found');
  }
}
