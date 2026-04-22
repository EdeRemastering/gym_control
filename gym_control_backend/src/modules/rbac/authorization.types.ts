import { PermissionScope } from '@prisma/client';

export interface AuthUserContext {
  id: string;
  gymId: string;
}

export interface PermissionDescriptor {
  resource: string;
  action: string;
}

export interface ResolvedPermission {
  resource: string;
  action: string;
  scopes: PermissionScope[];
}

export interface OwnershipResolverInput {
  user: AuthUserContext;
  gymId: string;
}

export interface OwnershipResolverResult {
  ownWhere?: Record<string, unknown>;
  gymWhere?: Record<string, unknown>;
}

export type OwnershipResolver = (
  input: OwnershipResolverInput,
) => Promise<OwnershipResolverResult> | OwnershipResolverResult;
