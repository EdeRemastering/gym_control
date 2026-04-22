import { ForbiddenException } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { AuthUserContext } from './authorization.types';
import { OwnershipRegistry } from './ownership.registry';

export function buildScopeWhere(
  user: AuthUserContext,
  scope: PermissionScope,
  gymId: string,
  ownWhere: Record<string, unknown> = { userId: user.id, gymId },
  gymWhere: Record<string, unknown> = { gymId },
): Record<string, unknown> {
  if (scope === PermissionScope.OWN) {
    return ownWhere;
  }
  if (scope === PermissionScope.GYM) {
    return gymWhere;
  }
  return {};
}

export async function buildOwnershipWhere(
  registry: OwnershipRegistry,
  resource: string,
  user: AuthUserContext,
  gymId: string,
  scope: PermissionScope,
): Promise<Record<string, unknown>> {
  const resolver = registry.resolve(resource);
  const ownership = resolver
    ? await resolver({ user, gymId })
    : registry.buildDefault(user, gymId);

  return buildScopeWhere(
    user,
    scope,
    gymId,
    ownership.ownWhere ?? { userId: user.id, gymId },
    ownership.gymWhere ?? { gymId },
  );
}

export function assertOwnershipAccess(recordExists: boolean): void {
  if (!recordExists) {
    throw new ForbiddenException('Ownership check failed');
  }
}
