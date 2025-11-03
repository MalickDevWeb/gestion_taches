import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from '../../infrastructure/repositories/transfers.repository';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { TransferProcessingProcessor } from './transfer-processing.processor';
import { TransferResponseTransformer } from './transfer-response.transformer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transfer-processing',
    }),
  ],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    AuditService,
    AuditInterceptor,
    TransferProcessingProcessor,
    TransferResponseTransformer,
    {
      provide: 'ITransfersRepository',
      useClass: TransfersRepository,
    },
  ],
  exports: [TransfersService, AuditService],
})
export class TransfersModule {}
