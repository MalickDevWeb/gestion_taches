import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { AuditService } from './audit.service';

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
export class CleanupProcessor extends WorkerHost {
  constructor(
    @InjectRepository(TransferEntity)
    private readonly transferRepository: Repository<TransferEntity>,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  private readonly logger = new Logger(CleanupProcessor.name);

  async process(job: Job<CleanupJobData>): Promise<void> {
    const { keepLastN, filters } = job.data;

    try {
      this.logger.log(`Starting cleanup job: keep last ${keepLastN} transfers`, { filters });

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
        this.logger.log(`No cleanup needed: only ${allTransfers.length} transfers found, keeping ${keepLastN}`);
        return;
      }

      // Keep the last N transfers, delete the rest
      const transfersToDelete = allTransfers.slice(keepLastN);
      const transferIdsToDelete = transfersToDelete.map(t => t.id);

      this.logger.log(`Deleting ${transfersToDelete.length} transfers`, {
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

      this.logger.log(`Cleanup completed: deleted ${deleteResult.affected} transfers`);

    } catch (error) {
      this.logger.error(`Error in CleanupProcessor.process`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CleanupJobData>) {
    this.logger.log(`Cleanup job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CleanupJobData>, err: Error) {
    this.logger.error(`Cleanup job ${job.id} failed`, err);
  }
}
