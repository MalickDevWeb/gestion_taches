import { IsOptional, IsEnum, IsNumber, IsString, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatusFilter } from '../../../core/entities/transfer-status-filter.enum';
import { PaginationDto } from '../../../core/dto/pagination.dto';

export class TransferQueryDto extends PaginationDto {

  @ApiPropertyOptional({
    description: 'Filter by transfer status',
    enum: TransferStatusFilter,
    example: TransferStatusFilter.PENDING
  })
  @IsOptional()
  @IsEnum(TransferStatusFilter)
  status?: TransferStatusFilter;

  @ApiPropertyOptional({
    description: 'Minimum transfer amount',
    example: 100,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum transfer amount',
    example: 10000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter transfers created after this date (ISO 8601)',
    example: '2023-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter transfers created before this date (ISO 8601)',
    example: '2023-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter by currency',
    example: 'USD'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Filter by channel',
    example: 'mobile'
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({
    description: 'Filter by reference',
    example: 'TXN-12345'
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Search in reference or recipient name',
    example: 'TRF-20250101'
  })
  @IsOptional()
  @IsString()
  q?: string;
}
