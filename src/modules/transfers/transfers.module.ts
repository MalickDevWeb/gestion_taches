import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from '../../infrastructure/repositories/transfers.repository';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { TransferProcessingProcessor } from './transfer-processing.processor';
import { TransferResponseTransformer } from './transfer-response.transformer';
import { CleanupProcessor } from './cleanup.processor';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransferEntity]),
    BullModule.registerQueueAsync({
      name: 'transfer-processing',
      useFactory: (): any => {
        if (process.env.REDIS_URL) {
          return { connection: process.env.REDIS_URL };
        }
        // For production deployment, disable Redis if not available
        if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
          return {
            connection: {
              host: 'disabled',
              port: 6379,
            },
          };
        }
        return {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'cleanup',
    }),
  ],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    AuditService,
    AuditInterceptor,
    TransferProcessingProcessor,
    TransferResponseTransformer,
    CleanupProcessor,
    CleanupService,
    {
      provide: 'ITransfersRepository',
      useClass: TransfersRepository,
    },
  ],
  exports: [TransfersService, AuditService, CleanupService],
})
export class TransfersModule {}
