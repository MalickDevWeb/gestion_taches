import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { UsersModule } from './modules/users/users.module';
import { TransfersModule } from './modules/transfers/transfers.module';

@Module({
  imports: [
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
