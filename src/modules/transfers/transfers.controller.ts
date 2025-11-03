import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors, Bind } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { AuditService } from './audit.service';
import { TransferResponseTransformer } from './transfer-response.transformer';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { TransferResponseDto } from './transfer-response.dto';
import { ApiKeyGuard } from '../../core/guards/api-key.guard';
import { AuditInterceptor } from './audit.interceptor';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { AuditLog } from '../../core/interfaces/audit-log.interface';
import { ResponseMessages } from '../../core/constants/response-messages.enum';
import { HttpStatusCodes } from '../../core/constants/http-status-codes.enum';

@ApiTags('transfers')
@Controller('transfers')
@UseGuards(ApiKeyGuard)
@UseInterceptors(AuditInterceptor)
export class TransfersController {
  constructor(
    private readonly transfersService: TransfersService,
    private readonly auditService: AuditService,
    private readonly transferResponseTransformer: TransferResponseTransformer
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiBody({
    type: CreateTransferDto,
    examples: {
      example1: {
        summary: 'Basic transfer',
        value: {
          amount: 1000,
          currency: 'USD',
          channel: 'mobile',
          recipient: {
            phone: '+1234567890',
            name: 'John Doe'
          },
          metadata: { source: 'web' },
          reference: 'TXN-12345'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatusCodes.CREATED,
    description: ResponseMessages.TRANSFER_CREATED_SUCCESSFULLY,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  async create(@Body() createTransferDto: CreateTransferDto): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.create(createTransferDto);
    return this.transferResponseTransformer.transform(transfer);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transfers with optional filters' })
  @ApiQuery({ type: TransferQueryDto })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TRANSFERS_LIST,
    type: [TransferResponseDto]
  })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  async findAll(@Query() query: TransferQueryDto): Promise<{ data: TransferResponseDto[]; hasNext: boolean; nextCursor?: string }> {
    const result = await this.transfersService.findAll(query);
    return {
      data: this.transferResponseTransformer.transformMany(result.data),
      hasNext: result.hasNextPage,
      nextCursor: result.nextCursor,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TRANSFER_DETAILS,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  @Bind(Param('id'))
  async findById(id: string): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.findById(id);
    return this.transferResponseTransformer.transform(transfer);
  }

  @Bind(Param('id'), Body())
  @Patch(':id')
  @ApiOperation({ summary: 'Update transfer status' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiBody({
    type: UpdateTransferDto,
    examples: {
      example1: {
        summary: 'Update status to processing',
        value: { status: 'PROCESSING' }
      },
      example2: {
        summary: 'Update amount',
        value: { amount: 1500 }
      }
    }
  })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TRANSFER_UPDATED_SUCCESSFULLY,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  async updateStatus(id: string, updateTransferDto: UpdateTransferDto): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.updateStatus(id, updateTransferDto);
    return this.transferResponseTransformer.transform(transfer);
  }

  @Bind(Param('id'))
  @Post(':id/simulate')
  @ApiOperation({ summary: 'Simulate transfer processing' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.PROCESSING_SIMULATION_COMPLETED,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  async simulateProcessing(id: string): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.simulateProcessing(id);
    return this.transferResponseTransformer.transform(transfer);
  }

  @Bind(Param('id'))
  @Get(':id/audit')
  @ApiOperation({ summary: 'Get audit logs for a transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.AUDIT_LOGS_RETRIEVED_SUCCESSFULLY,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          transferId: { type: 'string' },
          action: { type: 'string' },
          oldValues: { type: 'object' },
          newValues: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
          userId: { type: 'string' }
        }
      }
    },
    example: [
      {
        id: 'log-1',
        transferId: 'transfer-123',
        action: 'STATUS_CHANGE',
        oldValues: { status: 'PENDING' },
        newValues: { status: 'PROCESSING' },
        timestamp: '2023-11-03T00:00:00.000Z',
        userId: 'user-456'
      }
    ]
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  getAuditLogs(id: string) {
    return this.auditService.getLogsForTransfer(id);
  }
}
