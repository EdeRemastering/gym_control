import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  listByTable(tableName: string, recordId?: string) {
    return this.prisma.auditLog.findMany({
      where: { tableName, ...(recordId ? { recordId } : {}) },
      orderBy: { changedAt: 'desc' },
      take: 200,
    });
  }
}
