import { DataSource } from 'typeorm';
import { UserEntity } from '../core/entities/user.entity';
import { TransferEntity } from '../core/entities/transfer.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'dexchange_db',
      }),
  entities: [UserEntity, TransferEntity],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false, // Désactiver synchronize en production
  migrationsRun: false, // Les migrations sont exécutées manuellement
  logging: process.env.NODE_ENV === 'development',
  extra: process.env.DATABASE_URL ? {} : {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});
