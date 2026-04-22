import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { SKIP_GYM_VALIDATION } from '../../../common/decorators/skip-gym-validation.decorator';
import {
  RBAC_PERMISSION_METADATA,
  RBAC_SCOPE_METADATA,
} from '../rbac.decorators';
import { RbacService } from '../rbac.service';
import { OwnershipRegistry } from '../ownership.registry';
import { buildOwnershipWhere } from '../ownership.helper';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly ownershipRegistry: OwnershipRegistry,
    private readonly rbacService?: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: string; gymId?: string };
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: Record<string, unknown>;
      headers?: Record<string, unknown>;
      gymId?: string;
      authz?: {
        resource?: string;
        action?: string;
        scope?: PermissionScope;
        where?: Record<string, unknown>;
      };
    }>();

    const isPublic = this.getMetadata<boolean>('isPublic', context);
    if (isPublic) {
      return true;
    }

    if (!this.rbacService) {
      return true;
    }

    if (!request.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const skipGymValidation = this.getMetadata<boolean>(
      SKIP_GYM_VALIDATION,
      context,
    );

    const gymId = this.extractGymId(request);
    if (!gymId && !skipGymValidation) {
      throw new ForbiddenException('Gym context is required');
    }
    if (gymId) {
      request.gymId = gymId;
      const hasGymAccess = await this.rbacService.validateUserGymAccess(
        request.user.id,
        gymId,
      );
      if (!hasGymAccess) {
        throw new ForbiddenException('Cross-tenant access denied');
      }
    }

    const requiredPermission = this.getRequiredPermission(context);
    if (!requiredPermission) {
      return true;
    }
    if (!request.gymId) {
      throw new ForbiddenException('Gym context is required');
    }

    const descriptor = this.rbacService.parsePermission(requiredPermission);
    const phaseOneAllowed = await this.rbacService.hasPermission(
      request.user.id,
      request.gymId,
      descriptor,
    );
    if (!phaseOneAllowed) {
      throw new ForbiddenException('Permission denied');
    }

    const resolvedScope = await this.rbacService.resolvePermissionScope(
      request.user.id,
      request.gymId,
      descriptor,
    );
    if (!resolvedScope) {
      throw new ForbiddenException('Permission scope not resolved');
    }

    const requiredScope =
      this.getMetadata<PermissionScope>(RBAC_SCOPE_METADATA, context) ??
      PermissionScope.OWN;

    const effectiveScope = this.resolveEffectiveScope(
      resolvedScope,
      requiredScope,
    );
    if (!effectiveScope) {
      throw new ForbiddenException('Scope denied');
    }

    const where = await buildOwnershipWhere(
      this.ownershipRegistry,
      descriptor.resource,
      { id: request.user.id, gymId: request.gymId },
      request.gymId,
      effectiveScope,
    );

    request.authz = {
      resource: descriptor.resource,
      action: descriptor.action,
      scope: effectiveScope,
      where,
    };

    return true;
  }

  private getRequiredPermission(context: ExecutionContext): string | null {
    const direct = this.getMetadata<string>(RBAC_PERMISSION_METADATA, context);
    if (direct) {
      return direct;
    }

    const legacyList = this.getMetadata<string[]>('permissions', context);
    if (!legacyList?.length) {
      return null;
    }

    return legacyList[0];
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

  private resolveEffectiveScope(
    granted: PermissionScope,
    required: PermissionScope,
  ): PermissionScope | null {
    const rank = {
      [PermissionScope.OWN]: 1,
      [PermissionScope.GYM]: 2,
      [PermissionScope.GLOBAL]: 3,
    };
    return rank[granted] >= rank[required] ? required : null;
  }

  private extractGymId(request: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    user?: { gymId?: string };
  }): string | undefined {
    const values = [
      request.params?.gymId,
      request.query?.gymId,
      request.body?.gymId,
      request.headers?.['x-gym-id'],
      request.user?.gymId,
    ].filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    if (values.length === 0) {
      return undefined;
    }

    const [first] = values;
    if (values.some((value) => value !== first)) {
      throw new ForbiddenException('Conflicting gymId values in request');
    }
    return first;
  }
}
