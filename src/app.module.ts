import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { UsersModule } from './modules/users/users.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { UserEntity } from './core/entities/user.entity';
import { TransferEntity } from './core/entities/transfer.entity';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    UsersModule,
    TransfersModule,
  ],
})
export class AppModule {}
