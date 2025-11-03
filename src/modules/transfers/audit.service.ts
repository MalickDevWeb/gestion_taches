import { Injectable } from '@nestjs/common';
import { AuditLog } from '../../core/interfaces/audit-log.interface';

@Injectable()
export class AuditService {
  private auditLogs: AuditLog[] = [];
  private nextId = 1;

  log(transferId: string, action: string, oldValues?: any, newValues?: any, userId?: string): void {
    const auditLog: AuditLog = {
      id: this.nextId.toString(),
      transferId,
      action,
      oldValues,
      newValues,
      timestamp: new Date(),
      userId,
    };
    this.auditLogs.push(auditLog);
    this.nextId++;
  }

  getLogsForTransfer(transferId: string): AuditLog[] {
    return this.auditLogs.filter(log => log.transferId === transferId);
  }

  getAllLogs(): AuditLog[] {
    return [...this.auditLogs];
  }
}
