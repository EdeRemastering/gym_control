import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ClassBookingStatus,
  ClassLevel,
  ClassSessionStatus,
} from '@prisma/client';

export class CreateClassDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  trainerId?: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(ClassLevel)
  level?: ClassLevel;
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  trainerId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(ClassLevel)
  level?: ClassLevel;
}

export class CreateClassScheduleDto {
  @IsString()
  classId: string;

  @IsInt()
  @Min(1)
  dayOfWeek: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateClassScheduleDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  dayOfWeek?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateClassSessionDto {
  @IsString()
  classId: string;

  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;
}

export class UpdateClassSessionDto {
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;
}

export class CreateClassBookingDto {
  @IsString()
  sessionId: string;

  @IsString()
  userId: string;
}

export class UpdateClassBookingDto {
  @IsEnum(ClassBookingStatus)
  status: ClassBookingStatus;
}
