import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE === 'sqlite' ? 'sqlite' : 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'dexchange_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: process.env.NODE_ENV === 'production',
  // PostgreSQL specific config for production
  ...(process.env.DB_TYPE === 'postgres' && process.env.NODE_ENV === 'production' && {
    extra: {
      ssl: { rejectUnauthorized: false }
    }
  }),
  // SQLite specific config
  ...(process.env.DB_TYPE === 'sqlite' && {
    database: ':memory:',
    synchronize: true,
    logging: false,
  }),
};
