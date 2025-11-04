import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import type { ITransfersRepository } from '../../core/interfaces/transfers-repository.interface';
import type { TransferFilters, PaginationOptions } from '../../core/interfaces/transfers-repository.interface';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { TransferProcessingJobData } from './transfer-processing.processor';
import { AuditService } from './audit.service';
import { ResponseMessages } from '../../core/constants/response-messages.enum';
import { HttpStatusCodes } from '../../core/constants/http-status-codes.enum';

@Injectable()
export class TransfersService {
  constructor(
    @Inject('ITransfersRepository')
    private readonly transfersRepository: ITransfersRepository,
    @InjectQueue('transfer-processing')
    private readonly transferProcessingQueue: Queue<TransferProcessingJobData>,
    private readonly auditService: AuditService
  ) {}

  async create(createTransferDto: CreateTransferDto): Promise<TransferEntity> {
    const reference = createTransferDto.reference || await this.generateReference();
    const fees = this.calculateFees(createTransferDto.amount);
    const total = createTransferDto.amount + fees;

    const transfer = TransferEntity.create(
      '', // id will be set by repository
      createTransferDto.amount,
      createTransferDto.currency,
      createTransferDto.channel,
      createTransferDto.recipient,
      createTransferDto.metadata || {},
      TransferStatus.PENDING,
      reference,
      fees,
      total,
      new Date(),
      new Date()
    );

    const createdTransfer = await this.transfersRepository.create(transfer);

    // Queue the transfer for background processing
    await this.transferProcessingQueue.add('process-transfer', {
      transferId: createdTransfer.getId(),
    });

    return createdTransfer;
  }

  async findAll(query: TransferQueryDto) {
    const filters: TransferFilters = {
      status: query.status,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
      createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
      currency: query.currency,
      channel: query.channel,
      reference: query.reference,
      q: query.q,
    };

    const options = {
      cursor: query.cursor,
      limit: query.limit || 10,
    };

    return this.transfersRepository.findWithFiltersAndCursorPagination(filters, options);
  }

  async findById(id: string): Promise<TransferEntity> {
    const transfer = await this.transfersRepository.findById(id);
    if (!transfer) {
      throw new NotFoundException(ResponseMessages.TRANSFER_NOT_FOUND);
    }
    return transfer;
  }

  async updateStatus(id: string, updateTransferDto: UpdateTransferDto): Promise<TransferEntity> {
    const transfer = await this.findById(id);
    if (updateTransferDto.status) {
      transfer.setStatus(updateTransferDto.status);
    }
    if (updateTransferDto.amount !== undefined) {
      transfer.setAmount(updateTransferDto.amount);
    }
    // Note: Other fields are not updatable via this endpoint as per requirements
    const updatedTransfer = await this.transfersRepository.update(id, transfer);
    if (!updatedTransfer) {
      throw new NotFoundException(ResponseMessages.TRANSFER_NOT_FOUND);
    }
    return updatedTransfer;
  }

  async processTransfer(id: string): Promise<TransferEntity> {
    const transfer = await this.findById(id);
    if (transfer.getStatus() !== TransferStatus.PENDING) {
      throw new ConflictException(ResponseMessages.TRANSFER_CANNOT_BE_PROCESSED);
    }

    // Set to processing
    transfer.setStatus(TransferStatus.PROCESSING);

    // Simulate random outcome (70% success, 30% failed)
    const isSuccess = Math.random() > 0.3;
    setTimeout(() => {
      if (isSuccess) {
        transfer.setStatus(TransferStatus.COMPLETED);
        // Log success audit
        this.auditService?.log(id, 'TRANSFER_SUCCESS', { status: TransferStatus.PROCESSING }, { status: TransferStatus.COMPLETED });
      } else {
        transfer.setStatus(TransferStatus.FAILED);
        // Log failure audit
        this.auditService?.log(id, 'TRANSFER_FAILED', { status: TransferStatus.PROCESSING }, { status: TransferStatus.FAILED });
      }
      this.transfersRepository.update(id, transfer);
    }, 2000); // Simulate 2 second processing time

    // Log processing start
    this.auditService?.log(id, 'TRANSFER_PROCESSING', { status: TransferStatus.PENDING }, { status: TransferStatus.PROCESSING });

    const updatedTransfer = await this.transfersRepository.update(id, transfer);
    if (!updatedTransfer) {
      throw new NotFoundException(ResponseMessages.TRANSFER_NOT_FOUND);
    }
    return updatedTransfer;
  }

  private calculateFees(amount: number): number {
    const fee = Math.ceil(amount * 0.008);
    return Math.min(Math.max(fee, 100), 1500);
  }

  async cancelTransfer(id: string): Promise<TransferEntity> {
    const transfer = await this.findById(id);
    if (transfer.getStatus() !== TransferStatus.PENDING) {
      throw new ConflictException(ResponseMessages.TRANSFER_CANNOT_BE_CANCELLED);
    }

    transfer.setStatus(TransferStatus.CANCELLED);
    const updatedTransfer = await this.transfersRepository.update(id, transfer);
    if (!updatedTransfer) {
      throw new NotFoundException(ResponseMessages.TRANSFER_NOT_FOUND);
    }

    // Log cancellation audit
    this.auditService.log(id, 'TRANSFER_CANCELED', { status: TransferStatus.PENDING }, { status: TransferStatus.CANCELLED });

    return updatedTransfer;
  }

  private async generateReference(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRF-${dateStr}-${randomPart}`;
  }
}
