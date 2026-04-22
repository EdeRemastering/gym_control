import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CheckinType, UserActivityType } from '@prisma/client';

export class CreateCheckinDto {
  @IsString()
  userId: string;
  @IsOptional()
  @IsString()
  validateBy?: string;
  @IsOptional()
  @IsEnum(CheckinType)
  type?: CheckinType;
}

export class CreateUserActivityDto {
  @IsString()
  userId: string;
  @IsEnum(UserActivityType)
  type: UserActivityType;
  @IsOptional()
  metadata?: Record<string, unknown>;
}
