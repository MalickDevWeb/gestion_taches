import { ApiProperty } from '@nestjs/swagger';
import { TransferStatus } from '../../core/entities/transfer-status.enum';

interface Recipient {
  phone: string;
  name: string;
}

interface Metadata {
  [key: string]: any;
}

export class TransferResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  channel!: string;

  @ApiProperty()
  recipient!: Recipient;

  @ApiProperty()
  metadata!: Metadata;

  @ApiProperty({ enum: TransferStatus })
  status!: TransferStatus;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  fees!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  // Additional transformed fields
  @ApiProperty({ description: 'Formatted amount with currency' })
  formattedAmount!: string;

  @ApiProperty({ description: 'Human readable status' })
  statusLabel!: string;

  @ApiProperty({ description: 'Processing time in minutes' })
  processingTimeMinutes?: number;
}
