import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTransferDto } from './create-transfer.dto';
import { TransferStatus } from '../../../core/entities/transfer-status.enum';

export class UpdateTransferDto extends PartialType(CreateTransferDto) {
  @ApiPropertyOptional({
    description: 'Transfer status',
    enum: TransferStatus,
    example: TransferStatus.PROCESSING
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional({
    description: 'Transfer amount',
    example: 1500,
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
