import { Controller, Get, Query } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Permission('audit_log:read')
  @Scope(PermissionScope.GLOBAL)
  list(
    @Query('tableName') tableName: string,
    @Query('recordId') recordId?: string,
  ) {
    return this.auditService.listByTable(tableName, recordId);
  }
}
