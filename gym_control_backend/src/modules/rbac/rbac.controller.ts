import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from './rbac.decorators';
import { RbacService } from './rbac.service';

@Controller('gyms/:gymId/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @Permission('permission:read')
  @Scope(PermissionScope.GLOBAL)
  listPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('permissions')
  @Permission('user:create')
  @Scope(PermissionScope.GYM)
  createPermission(
    @Body()
    dto: {
      name: string;
      resource: string;
      action: string;
      scope: PermissionScope;
    },
  ) {
    return this.rbacService.createPermission(
      dto.name,
      dto.resource,
      dto.action,
      dto.scope,
    );
  }

  @Get('roles')
  @Permission('role:read')
  @Scope(PermissionScope.GYM)
  listRoles(@Param('gymId') gymId: string) {
    return this.rbacService.listRolesByGym(gymId);
  }

  @Post('roles')
  @Permission('user:create')
  @Scope(PermissionScope.GYM)
  createRole(
    @Param('gymId') gymId: string,
    @Body() dto: { name: string; description?: string },
  ) {
    return this.rbacService.createRole(gymId, dto.name, dto.description);
  }

  @Get('roles/:roleId/permissions')
  @Permission('role_permission:read')
  @Scope(PermissionScope.GYM)
  listRolePermissions(@Param('roleId') roleId: string) {
    return this.rbacService.listPermissionsByRole(roleId);
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @Permission('role_permission:create')
  @Scope(PermissionScope.GYM)
  assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @Permission('role_permission:delete')
  @Scope(PermissionScope.GYM)
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }
}
