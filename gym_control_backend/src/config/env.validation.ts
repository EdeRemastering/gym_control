import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment Variables Class
 * Validates all required environment variables on application startup
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV?: Environment = Environment.Development;

  @IsNumber()
  PORT?: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN?: string = '24h';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string = '7d';

  @IsString()
  CORS_ORIGIN?: string = 'http://localhost:3000';

  @IsString()
  DEBUG?: string = 'false';

  @IsString()
  RBAC_CACHE_ENABLED?: string = 'true';

  @IsString()
  RBAC_CACHE_PROVIDER?: string = 'memory';

  @IsString()
  RBAC_CACHE_TTL_SECONDS?: string = '300';

  @IsString()
  RBAC_CACHE_MAX_SIZE?: string = '10000';

  @IsString()
  REDIS_HOST?: string = 'localhost';

  @IsString()
  REDIS_PORT?: string = '6379';

  @IsString()
  REDIS_PASSWORD?: string = '';

  @IsString()
  REDIS_DB?: string = '0';
}

/**
 * Validates environment variables against the schema
 * Throws error if any required variables are missing or invalid
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
