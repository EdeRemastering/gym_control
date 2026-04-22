import { SetMetadata } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';

export const RBAC_PERMISSION_METADATA = 'rbacPermission';
export const RBAC_SCOPE_METADATA = 'rbacScope';

/**
 * Permissions Decorator
 * Marks endpoint with required permissions
 * Usage: @Permissions('user.create', 'user.read')
 *
 * Can accept:
 * - Single permission as string: @Permissions('user.create')
 * - Multiple permissions: @Permissions('user.create', 'user.read')
 *
 * The guard will check if user has ALL of these permissions (AND logic)
 * For OR logic, use @AnyPermissions instead
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const Permission = (permission: string) =>
  SetMetadata(RBAC_PERMISSION_METADATA, permission);

export const Scope = (scope: PermissionScope) =>
  SetMetadata(RBAC_SCOPE_METADATA, scope);

/**
 * AnyPermissions Decorator
 * Marks endpoint where user needs ANY of the permissions (OR logic)
 * Usage: @AnyPermissions('admin.full', 'manager.access')
 */
export const AnyPermissions = (...permissions: string[]) =>
  SetMetadata('anyPermissions', permissions);

/**
 * Roles Decorator
 * Legacy support - marks endpoint with required roles
 * Less flexible than permissions, but useful for simple cases
 * Usage: @Roles('admin', 'trainer')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * GymId Decorator
 * Extracts gymId from route parameters
 * Applied by router before reaching controller
 * Ensures all operations are scoped to correct gym
 */
export const GymId = () => SetMetadata('gymId', true);

/**
 * Public Decorator
 * Bypasses permission checks for public endpoints
 * Usage: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);
