import { IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';

/**
 * CreateGymDto
 * DTO for gym creation
 */
export class CreateGymDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

/**
 * UpdateGymDto
 * DTO for gym updates
 */
export class UpdateGymDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

/**
 * GymResponseDto
 * Gym response DTO
 */
export class GymResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
