import { IsString, IsEmail } from 'class-validator';

/**
 * LoginDto
 * DTO for user login
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

/**
 * RegisterDto
 * DTO for user registration
 */
export class RegisterDto {
  @IsString()
  gymId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

/**
 * RefreshTokenDto
 * DTO for token refresh
 */
export class RefreshTokenDto {
  @IsString()
  userId: string;

  @IsString()
  refreshToken: string;
}

/**
 * AuthResponseDto
 * Authentication response with tokens
 */
export class AuthResponseDto {
  user: {
    id: string;
    gymId: string;
    name: string;
    email: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
