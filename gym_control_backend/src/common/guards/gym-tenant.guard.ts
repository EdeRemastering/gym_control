import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { RbacService } from '../../modules/rbac/rbac.service';
import { SKIP_GYM_VALIDATION } from '../decorators/skip-gym-validation.decorator';

/**
 * GymTenanGuard
 * Ensures user has access to the requested gym
 * Extracts gymId from route params and verifies user membership
 */
@Injectable()
export class GymTenantGuard implements CanActivate {
  constructor(private readonly rbacService?: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.getMetadata<boolean>('isPublic', context) ?? false;
    const skipGymValidation =
      this.getMetadata<boolean>(SKIP_GYM_VALIDATION, context) ?? false;

    const requestPath = String(request.path ?? request.url ?? '');
    const isAuthPublicRoute =
      requestPath.includes('/auth/login') ||
      requestPath.includes('/auth/register') ||
      requestPath.includes('/auth/refresh-token');

    if (isPublic || skipGymValidation || isAuthPublicRoute) {
      return true;
    }

    const userId = request.user?.id as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const gymId = this.extractGymId(request);
    if (!gymId) {
      throw new ForbiddenException('gymId is required in protected endpoints');
    }

    if (!this.rbacService) {
      request.gymId = gymId;
      return true;
    }

    const hasAccess = await this.rbacService.validateUserGymAccess(
      userId,
      gymId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    request.gymId = gymId;

    return true;
  }

  private getMetadata<T>(
    key: string,
    context: ExecutionContext,
  ): T | undefined {
    const handlerValue = Reflect.getMetadata(key, context.getHandler()) as
      | T
      | undefined;
    if (handlerValue !== undefined) return handlerValue;
    return Reflect.getMetadata(key, context.getClass()) as T | undefined;
  }

  private extractGymId(request: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  }): string | undefined {
    const candidates = [
      request.params?.gymId,
      request.query?.gymId,
      request.body?.gymId,
      request.headers?.['x-gym-id'],
    ];

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    return undefined;
  }
}
