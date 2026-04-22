import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignRoutineDto {
  @IsString()
  userId: string;

  @IsString()
  routineId: string;

  @IsOptional()
  @IsString()
  assignedBy?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateProgressDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  bodyFat?: string;

  @IsOptional()
  @IsString()
  muscle?: string;

  @IsDateString()
  measuredAt: string;
}

export class AddRoutineExerciseDto {
  @IsString()
  routineId: string;

  @IsString()
  exerciseId: string;

  @IsInt()
  @Min(1)
  sets: number;

  @IsInt()
  @Min(1)
  reps: number;
}
