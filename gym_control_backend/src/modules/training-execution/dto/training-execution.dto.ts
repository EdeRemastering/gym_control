import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkoutSessionStatus } from '@prisma/client';

export class CreateWorkoutSessionDto {
  @IsString()
  userId: string;

  @IsString()
  routineId: string;

  @IsDateString()
  startedAt: string;
}

export class UpdateWorkoutSessionDto {
  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsOptional()
  @IsEnum(WorkoutSessionStatus)
  status?: WorkoutSessionStatus;
}

export class CreateExerciseLogDto {
  @IsString()
  workoutSessionId: string;

  @IsString()
  exerciseId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSetLogDto {
  @IsString()
  exerciseLogId: string;

  @IsInt()
  reps: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsInt()
  restTime?: number;
}
