import { IsEmail, IsString, MaxLength, IsOptional } from 'class-validator';

/**
 * CreateUserDto
 * DTO for user creation in a gym
 */
export class CreateUserDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

/**
 * UpdateUserDto
 * DTO for updating user information
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

/**
 * UserListQueryDto
 * DTO for pagination and filtering
 */
export class UserListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * UserResponseDto
 * User response without sensitive fields
 */
export class UserResponseDto {
  id: string;
  gymId: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}
