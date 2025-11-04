import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { TransfersModule } from './modules/transfers/transfers.module';
import { TransferEntity } from './core/entities/transfer.entity';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TransfersModule,
  ],
})
export class AppModule {}
