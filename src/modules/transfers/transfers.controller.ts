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
          amount: 12500,
          currency: 'XOF',
          channel: 'WAVE',
          recipient: {
            phone: '+221770000000',
            name: 'Jane Doe'
          },
          metadata: { orderId: 'ABC-123' }
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
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'] })
  @ApiQuery({ name: 'channel', required: false, type: String })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search in reference or recipient name' })
  @ApiQuery({ name: 'limit', required: false, type: Number, maximum: 50 })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TRANSFERS_LIST,
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/TransferResponseDto' }
        },
        nextCursor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  async findAll(@Query() query: TransferQueryDto): Promise<{ items: TransferResponseDto[]; nextCursor?: string }> {
    const result = await this.transfersService.findAll(query);
    return {
      items: this.transferResponseTransformer.transformMany(result.data),
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


  @Bind(Param('id'))
  @Post(':id/process')
  @ApiOperation({ summary: 'Process transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.PROCESSING_SIMULATION_COMPLETED,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  @ApiResponse({ status: HttpStatusCodes.CONFLICT, description: ResponseMessages.TRANSFER_CANNOT_BE_PROCESSED })
  async processTransfer(id: string): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.processTransfer(id);
    return this.transferResponseTransformer.transform(transfer);
  }

  @Bind(Param('id'))
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a transfer' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TRANSFER_CANCELLED_SUCCESSFULLY,
    type: TransferResponseDto
  })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TRANSFER_NOT_FOUND })
  @ApiResponse({ status: HttpStatusCodes.CONFLICT, description: ResponseMessages.TRANSFER_CANNOT_BE_CANCELLED })
  async cancelTransfer(id: string): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.cancelTransfer(id);
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
        action: 'TRANSFER_CREATED',
        oldValues: null,
        newValues: { status: 'PENDING' },
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
