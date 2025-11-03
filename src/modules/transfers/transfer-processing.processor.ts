import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import type { ITransfersRepository } from '../../core/interfaces/transfers-repository.interface';

export interface TransferProcessingJobData {
  transferId: string;
}

@Injectable()
@Processor('transfer-processing')
export class TransferProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(TransferProcessingProcessor.name);

  constructor(
    @Inject('ITransfersRepository')
    private readonly transfersRepository: ITransfersRepository
  ) {
    super();
  }

  async process(job: Job<TransferProcessingJobData>): Promise<void> {
    const { transferId } = job.data;

    this.logger.log(`Processing transfer ${transferId}`);

    try {
      // Get the transfer
      const transfer = await this.transfersRepository.findById(transferId);
      if (!transfer) {
        throw new Error(`Transfer ${transferId} not found`);
      }

      // Check if transfer is in pending status
      if (transfer.getStatus() !== TransferStatus.PENDING) {
        this.logger.warn(`Transfer ${transferId} is not in pending status, skipping processing`);
        return;
      }

      // Update status to processing
      transfer.setStatus(TransferStatus.PROCESSING);
      await this.transfersRepository.update(transferId, transfer);

      // Simulate processing time (in real app, this would be actual business logic)
      await this.simulateProcessingDelay();

      // Simulate random outcome (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        transfer.setStatus(TransferStatus.COMPLETED);
        this.logger.log(`Transfer ${transferId} completed successfully`);
      } else {
        transfer.setStatus(TransferStatus.FAILED);
        this.logger.error(`Transfer ${transferId} failed`);
      }

      // Update the transfer
      await this.transfersRepository.update(transferId, transfer);

    } catch (error) {
      this.logger.error(`Failed to process transfer ${transferId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TransferProcessingJobData>) {
    this.logger.log(`Job ${job.id} completed for transfer ${job.data.transferId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TransferProcessingJobData>, err: Error) {
    this.logger.error(`Job ${job.id} failed for transfer ${job.data.transferId}:`, err);
  }

  private async simulateProcessingDelay(): Promise<void> {
    // Simulate processing time between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
