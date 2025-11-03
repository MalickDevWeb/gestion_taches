import { Injectable } from '@nestjs/common';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import { TransferResponseDto } from './transfer-response.dto';

@Injectable()
export class TransferResponseTransformer {
  transform(transfer: TransferEntity): TransferResponseDto {
    const response = new TransferResponseDto();

    // Copy all entity properties
    response.id = transfer.getId();
    response.amount = transfer.getAmount();
    response.currency = transfer.getCurrency();
    response.channel = transfer.getChannel();
    response.recipient = transfer.getRecipient();
    response.metadata = transfer.getMetadata();
    response.status = transfer.getStatus();
    response.reference = transfer.getReference();
    response.fees = transfer.getFees();
    response.total = transfer.getTotal();
    response.createdAt = transfer.getCreatedAt();
    response.updatedAt = transfer.getUpdatedAt();

    // Add transformed fields
    response.formattedAmount = this.formatAmount(transfer.getAmount(), transfer.getCurrency());
    response.statusLabel = this.getStatusLabel(transfer.getStatus());
    response.processingTimeMinutes = this.calculateProcessingTime(transfer);

    return response;
  }

  transformMany(transfers: TransferEntity[]): TransferResponseDto[] {
    return transfers.map(transfer => this.transform(transfer));
  }

  private formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  private getStatusLabel(status: TransferStatus): string {
    const statusLabels: Record<TransferStatus, string> = {
      [TransferStatus.PENDING]: 'Pending',
      [TransferStatus.PROCESSING]: 'Processing',
      [TransferStatus.COMPLETED]: 'Completed',
      [TransferStatus.FAILED]: 'Failed',
      [TransferStatus.CANCELLED]: 'Cancelled',
    };

    return statusLabels[status] || 'Unknown';
  }

  private calculateProcessingTime(transfer: TransferEntity): number | undefined {
    const status = transfer.getStatus();
    if (status === TransferStatus.PENDING) {
      return undefined; // Not yet processed
    }

    const createdAt = transfer.getCreatedAt();
    const updatedAt = transfer.getUpdatedAt();
    const diffMs = updatedAt.getTime() - createdAt.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    return diffMinutes > 0 ? diffMinutes : 1; // Minimum 1 minute
  }
}
