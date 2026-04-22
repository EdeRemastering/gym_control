import { SetMetadata } from '@nestjs/common';
export { SkipGymValidation } from './skip-gym-validation.decorator';

/**
 * GymId Decorator
 * Extracts and validates gymId from route parameters
 * Usage: @GymId() gymId: string
 */
export const GymId = () => SetMetadata('gymId', true);

/**
 * Roles Decorator
 * Specifies required roles for endpoint access
 * Usage: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * CurrentUser Decorator
 * Extracts authenticated user from request
 * Usage: @CurrentUser() user: UserPayload
 */
export const CurrentUser =
  () =>
  (
    _target: object,
    _propertyKey?: string | symbol,
    _parameterIndex?: number,
  ) => {
    // Implementation will be provided when auth strategy is defined
  };
