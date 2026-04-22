import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExerciseLogDto,
  CreateSetLogDto,
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
} from './dto/training-execution.dto';

@Injectable()
export class TrainingExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkoutSession(gymId: string, dto: CreateWorkoutSessionDto) {
    await this.ensureUser(gymId, dto.userId);
    await this.ensureRoutine(gymId, dto.routineId);

    return this.prisma.workoutSession.create({
      data: {
        gymId,
        userId: dto.userId,
        routineId: dto.routineId,
        startedAt: new Date(dto.startedAt),
      },
      select: this.workoutSessionSelect,
    });
  }

  async updateWorkoutSession(
    gymId: string,
    workoutSessionId: string,
    dto: UpdateWorkoutSessionDto,
  ) {
    await this.ensureWorkoutSession(gymId, workoutSessionId);
    return this.prisma.workoutSession.update({
      where: { id: workoutSessionId },
      data: {
        ...(dto.endedAt ? { endedAt: new Date(dto.endedAt) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      select: this.workoutSessionSelect,
    });
  }

  async listWorkoutSessions(gymId: string, userId?: string) {
    return this.prisma.workoutSession.findMany({
      where: {
        gymId,
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: this.workoutSessionSelect,
      take: 200,
    });
  }

  async createExerciseLog(gymId: string, dto: CreateExerciseLogDto) {
    await this.ensureWorkoutSession(gymId, dto.workoutSessionId);
    await this.ensureExercise(gymId, dto.exerciseId);

    return this.prisma.exerciseLog.create({
      data: {
        workoutSessionId: dto.workoutSessionId,
        exerciseId: dto.exerciseId,
        notes: dto.notes,
      },
      select: this.exerciseLogSelect,
    });
  }

  async createSetLog(gymId: string, dto: CreateSetLogDto) {
    await this.ensureExerciseLogInGym(gymId, dto.exerciseLogId);
    return this.prisma.setLog.create({
      data: {
        exerciseLogId: dto.exerciseLogId,
        reps: dto.reps,
        weight: dto.weight,
        duration: dto.duration,
        restTime: dto.restTime,
      },
      select: this.setLogSelect,
    });
  }

  async listExerciseLogs(gymId: string, workoutSessionId: string) {
    await this.ensureWorkoutSession(gymId, workoutSessionId);
    return this.prisma.exerciseLog.findMany({
      where: { workoutSessionId },
      orderBy: { createdAt: 'asc' },
      select: this.exerciseLogSelect,
    });
  }

  async listSetLogs(gymId: string, exerciseLogId: string) {
    await this.ensureExerciseLogInGym(gymId, exerciseLogId);
    return this.prisma.setLog.findMany({
      where: { exerciseLogId },
      orderBy: { createdAt: 'asc' },
      select: this.setLogSelect,
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

  private async ensureRoutine(gymId: string, routineId: string) {
    const routine = await this.prisma.routine.findFirst({
      where: { id: routineId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!routine) {
      throw new NotFoundException('Routine not found');
    }
  }

  private async ensureExercise(gymId: string, exerciseId: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
  }

  private async ensureWorkoutSession(gymId: string, workoutSessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: workoutSessionId, gymId },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException('Workout session not found');
    }
  }

  private async ensureExerciseLogInGym(gymId: string, exerciseLogId: string) {
    const log = await this.prisma.exerciseLog.findFirst({
      where: {
        id: exerciseLogId,
        workoutSession: {
          gymId,
        },
      },
      select: { id: true },
    });
    if (!log) {
      throw new NotFoundException('Exercise log not found');
    }
  }

  private readonly workoutSessionSelect = {
    id: true,
    gymId: true,
    userId: true,
    routineId: true,
    startedAt: true,
    endedAt: true,
    status: true,
    createdAt: true,
  };

  private readonly exerciseLogSelect = {
    id: true,
    workoutSessionId: true,
    exerciseId: true,
    notes: true,
    createdAt: true,
  };

  private readonly setLogSelect = {
    id: true,
    exerciseLogId: true,
    reps: true,
    weight: true,
    duration: true,
    restTime: true,
    createdAt: true,
  };
}
