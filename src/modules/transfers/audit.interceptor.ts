import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { TransferEntity } from '../../core/entities/transfer.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const params = request.params;

    let transferId: string | undefined;
    let action: string;
    let oldValues: any;
    let newValues: any;

    // Extract transfer ID from URL or params
    if (params.id) {
      transferId = params.id;
    }

    // Determine action based on method and URL
    if (method === 'POST' && url.includes('/transfers')) {
      action = 'CREATE';
      newValues = body;
    } else if (method === 'PATCH' && url.includes('/transfers/')) {
      action = 'UPDATE';
      newValues = body;
    } else if (method === 'POST' && url.includes('/simulate')) {
      action = 'SIMULATE_PROCESSING';
    } else {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        if (data instanceof TransferEntity) {
          // For create operations, log after creation
          if (action === 'CREATE') {
            this.auditService.log(data.getId(), action, oldValues, newValues);
          } else if (action === 'UPDATE' || action === 'SIMULATE_PROCESSING') {
            // For updates, we need to compare old and new values
            // Since we don't have the old entity here, we'll log with available data
            this.auditService.log(transferId!, action, oldValues, newValues);
          }
        }
      })
    );
  }
}
