import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not } from 'typeorm';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { AuditService } from './audit.service';
import { ErrorHandlingTrait } from '../../core/traits/error-handling.trait';

export interface CleanupJobData {
  keepLastN: number;
  filters?: {
    status?: string;
    currency?: string;
    channel?: string;
    minAmount?: number;
    maxAmount?: number;
    createdBefore?: Date;
  };
}

@Injectable()
@Processor('cleanup')
export class CleanupProcessor extends ErrorHandlingTrait {
  constructor(
    @InjectRepository(TransferEntity)
    private readonly transferRepository: Repository<TransferEntity>,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async process(job: Job<CleanupJobData>): Promise<void> {
    const { keepLastN, filters } = job.data;

    try {
      this.logInfo(`Starting cleanup job: keep last ${keepLastN} transfers`, { filters });

      // Build query with filters
      const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          queryBuilder.andWhere('transfer.status = :status', { status: filters.status });
        }
        if (filters.currency) {
          queryBuilder.andWhere('transfer.currency = :currency', { currency: filters.currency });
        }
        if (filters.channel) {
          queryBuilder.andWhere('transfer.channel = :channel', { channel: filters.channel });
        }
        if (filters.minAmount !== undefined) {
          queryBuilder.andWhere('transfer.amount >= :minAmount', { minAmount: filters.minAmount });
        }
        if (filters.maxAmount !== undefined) {
          queryBuilder.andWhere('transfer.amount <= :maxAmount', { maxAmount: filters.maxAmount });
        }
        if (filters.createdBefore) {
          queryBuilder.andWhere('transfer.createdAt < :createdBefore', { createdBefore: filters.createdBefore });
        }
      }

      // Get transfers ordered by creation date (newest first)
      queryBuilder.orderBy('transfer.createdAt', 'DESC');

      const allTransfers = await queryBuilder.getMany();

      if (allTransfers.length <= keepLastN) {
        this.logInfo(`No cleanup needed: only ${allTransfers.length} transfers found, keeping ${keepLastN}`);
        return;
      }

      // Keep the last N transfers, delete the rest
      const transfersToDelete = allTransfers.slice(keepLastN);
      const transferIdsToDelete = transfersToDelete.map(t => t.id);

      this.logInfo(`Deleting ${transfersToDelete.length} transfers`, {
        transferIds: transferIdsToDelete,
        filters
      });

      // Delete transfers
      const deleteResult = await this.transferRepository.delete(transferIdsToDelete);

      // Log audit for each deleted transfer
      for (const transfer of transfersToDelete) {
        await this.auditService?.log(
          transfer.id,
          'TRANSFER_DELETED_CLEANUP',
          { ...transfer },
          null
        );
      }

      this.logInfo(`Cleanup completed: deleted ${deleteResult.affected} transfers`);

    } catch (error) {
      this.handleError(error, 'CleanupProcessor.process');
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CleanupJobData>) {
    this.logInfo(`Cleanup job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CleanupJobData>, err: Error) {
    this.logError(`Cleanup job ${job.id} failed`, err);
  }
}
