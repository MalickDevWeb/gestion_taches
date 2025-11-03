export interface AuditLog {
  id: string;
  transferId: string;
  action: string;
  oldValues?: any;
  newValues?: any;
  timestamp: Date;
  userId?: string;
}
