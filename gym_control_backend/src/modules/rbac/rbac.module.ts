import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionCacheService } from './cache/permission-cache.service';
import { GymTenantGuard } from '../../common/guards/gym-tenant.guard';
import { OwnershipRegistry } from './ownership.registry';
import { OwnershipGuard } from './guards/ownership.guard';
import { AuthGuard } from './guards/auth.guard';

/**
 * RBAC Module
 * Provides role-based access control throughout the application
 *
 * Features:
 * - Dynamic role management per gym
 * - Flexible permission system (resource.action format)
 * - Per-request permission caching
 * - Decorators for easy endpoint protection
 * - Guards for automatic validation
 * - Multi-role support per user
 *
 * Usage in controller:
 * @Permissions('user.create', 'user.read')
 * @Post()
 * createUser() {}
 */
@Module({
  imports: [AuthModule],
  controllers: [RbacController],
  providers: [
    RbacService,
    PermissionCacheService,
    OwnershipRegistry,
    PermissionsGuard,
    OwnershipGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GymTenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnershipGuard,
    },
  ],
  exports: [RbacService, PermissionCacheService, OwnershipRegistry],
})
export class RbacModule {}
