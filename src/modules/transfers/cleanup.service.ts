import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CleanupJobData } from './cleanup.processor';
import { ErrorHandlingTrait } from '../../core/traits/error-handling.trait';

@Injectable()
export class CleanupService extends ErrorHandlingTrait {
  constructor(
    @InjectQueue('cleanup')
    private readonly cleanupQueue: Queue<CleanupJobData>,
  ) {
    super();
  }

  /**
   * Schedule daily cleanup at midnight
   * Keeps only the last 10 transfers
   * Note: Requires @nestjs/schedule package for cron jobs
   */
  async scheduledCleanup(): Promise<void> {
    try {
      this.logInfo('Starting scheduled daily cleanup');

      await this.addCleanupJob({
        keepLastN: 10,
        filters: {
          // Optional: add filters to only cleanup specific transfers
          // status: 'completed',
          // currency: 'XOF',
        }
      });

      this.logInfo('Scheduled daily cleanup job queued');
    } catch (error) {
      this.handleError(error, 'CleanupService.scheduledCleanup');
    }
  }

  /**
   * Manual cleanup method
   */
  async manualCleanup(keepLastN: number = 10, filters?: CleanupJobData['filters']): Promise<void> {
    try {
      this.logInfo(`Starting manual cleanup: keep last ${keepLastN} transfers`, { filters });

      await this.addCleanupJob({
        keepLastN,
        filters
      });

      this.logInfo('Manual cleanup job queued');
    } catch (error) {
      this.handleError(error, 'CleanupService.manualCleanup');
    }
  }

  /**
   * Add cleanup job to queue
   */
  private async addCleanupJob(data: CleanupJobData): Promise<void> {
    await this.cleanupQueue.add('cleanup-transfers', data, {
      removeOnComplete: 10, // Keep last 10 completed jobs
      removeOnFail: 5,     // Keep last 5 failed jobs
      attempts: 3,         // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000,       // 5 seconds initial delay
      }
    });
  }

  /**
   * Get cleanup queue status
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.cleanupQueue.getWaiting(),
      this.cleanupQueue.getActive(),
      this.cleanupQueue.getCompleted(),
      this.cleanupQueue.getFailed()
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}
