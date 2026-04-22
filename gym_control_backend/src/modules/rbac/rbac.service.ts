import { Injectable, Scope } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionCacheService } from './cache/permission-cache.service';
import {
  PermissionDescriptor,
  ResolvedPermission,
} from './authorization.types';

export interface UserPermissionsContext {
  userId: string;
  gymId: string;
  permissions: ResolvedPermission[];
  roles: string[];
}

@Injectable({ scope: Scope.REQUEST })
export class RbacService {
  private readonly requestPermissionsCache = new Map<
    string,
    UserPermissionsContext
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionCache: PermissionCacheService,
  ) {}

  async getUserRoles(userId: string, gymId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId, gymId },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return userRoles.map((item) => item.role.name);
  }

  async getUserPermissions(
    userId: string,
    gymId: string,
  ): Promise<ResolvedPermission[]> {
    const context = await this.getUserPermissionContext(userId, gymId);
    return context.permissions;
  }

  async hasPermission(
    userId: string,
    gymId: string,
    descriptor: PermissionDescriptor,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, gymId);
    return permissions.some(
      (permission) =>
        permission.resource === descriptor.resource &&
        permission.action === descriptor.action,
    );
  }

  async hasAnyPermission(
    userId: string,
    gymId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, gymId);
    const normalized = userPermissions.map(
      (permission) => `${permission.resource}:${permission.action}`,
    );
    return permissions.some((permission) =>
      normalized.includes(permission.replace('.', ':').toLowerCase()),
    );
  }

  async hasAllPermissions(
    userId: string,
    gymId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, gymId);
    const normalized = userPermissions.map(
      (permission) => `${permission.resource}:${permission.action}`,
    );
    return permissions.every((permission) =>
      normalized.includes(permission.replace('.', ':').toLowerCase()),
    );
  }

  async resolvePermissionScope(
    userId: string,
    gymId: string,
    descriptor: PermissionDescriptor,
  ): Promise<PermissionScope | null> {
    const permissions = await this.getUserPermissions(userId, gymId);
    const resolved = permissions.find(
      (permission) =>
        permission.resource === descriptor.resource &&
        permission.action === descriptor.action,
    );

    if (!resolved) {
      return null;
    }

    if (resolved.scopes.includes(PermissionScope.GLOBAL)) {
      return PermissionScope.GLOBAL;
    }
    if (resolved.scopes.includes(PermissionScope.GYM)) {
      return PermissionScope.GYM;
    }
    if (resolved.scopes.includes(PermissionScope.OWN)) {
      return PermissionScope.OWN;
    }

    return null;
  }

  async getUserPermissionContext(
    userId: string,
    gymId: string,
  ): Promise<UserPermissionsContext> {
    const cacheKey = this.permissionCache.buildKey(userId, gymId);
    const requestCached = this.requestPermissionsCache.get(cacheKey);
    if (requestCached) {
      return requestCached;
    }

    const payload = await this.permissionCache.getOrLoad(
      userId,
      gymId,
      async () => {
        const rows = await this.prisma.userRole.findMany({
          where: { userId, gymId },
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        resource: true,
                        action: true,
                        scope: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const roleNames: string[] = [];
        const permissionsByKey = new Map<string, Set<PermissionScope>>();

        for (const row of rows) {
          roleNames.push(row.role.name);
          for (const rp of row.role.permissions) {
            const key = `${rp.permission.resource}:${rp.permission.action}`;
            if (!permissionsByKey.has(key)) {
              permissionsByKey.set(key, new Set<PermissionScope>());
            }
            permissionsByKey.get(key)?.add(rp.permission.scope);
          }
        }

        return {
          roles: roleNames,
          permissions: Array.from(permissionsByKey.entries()).map(
            ([key, scopes]) => {
              const [resource, action] = key.split(':');
              return {
                resource,
                action,
                scopes: Array.from(scopes),
              };
            },
          ),
        };
      },
    );

    const context: UserPermissionsContext = {
      userId,
      gymId,
      roles: payload.roles,
      permissions: payload.permissions.map((permission) => ({
        resource: permission.resource,
        action: permission.action,
        scopes: permission.scopes as PermissionScope[],
      })),
    };

    this.requestPermissionsCache.set(cacheKey, context);
    return context;
  }

  async validateUserGymAccess(userId: string, gymId: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        gymId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return !!user;
  }

  parsePermission(permission: string): PermissionDescriptor {
    const normalized = permission.replace('.', ':').toLowerCase();
    const [resource, action] = normalized.split(':');
    return { resource, action };
  }

  async assignRoleToUser(userId: string, roleId: string, gymId: string) {
    const result = await this.prisma.userRole.create({
      data: { userId, roleId, gymId },
      select: {
        id: true,
        userId: true,
        roleId: true,
        gymId: true,
      },
    });

    await this.invalidatePermissionCache(userId, gymId);
    return result;
  }

  async removeRoleFromUser(userId: string, roleId: string, gymId: string) {
    const result = await this.prisma.userRole.deleteMany({
      where: { userId, roleId, gymId },
    });
    await this.invalidatePermissionCache(userId, gymId);
    return result;
  }

  async createRole(gymId: string, name: string, description?: string) {
    return this.prisma.role.create({
      data: { gymId, name, description },
      select: { id: true, gymId: true, name: true, description: true },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    const result = await this.prisma.rolePermission.create({
      data: { roleId, permissionId },
      select: { roleId: true, permissionId: true },
    });
    await this.invalidateUsersByRole(roleId);
    return result;
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const result = await this.prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });
    await this.invalidateUsersByRole(roleId);
    return result;
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }, { scope: 'asc' }],
      select: {
        id: true,
        resource: true,
        action: true,
        scope: true,
        name: true,
      },
    });
  }

  private async invalidatePermissionCache(
    userId: string,
    gymId: string,
  ): Promise<void> {
    const cacheKey = this.permissionCache.buildKey(userId, gymId);
    this.requestPermissionsCache.delete(cacheKey);
    await this.permissionCache.invalidateUserGym(userId, gymId);
  }

  private async invalidateUsersByRole(roleId: string): Promise<void> {
    const impactedUsers = await this.prisma.userRole.findMany({
      where: { roleId },
      select: {
        userId: true,
        gymId: true,
      },
    });

    for (const user of impactedUsers) {
      this.requestPermissionsCache.delete(
        this.permissionCache.buildKey(user.userId, user.gymId),
      );
    }
    await this.permissionCache.invalidateMany(impactedUsers);
  }
}
