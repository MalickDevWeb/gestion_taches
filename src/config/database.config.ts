import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres', // Force PostgreSQL for production
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: process.env.NODE_ENV === 'production',
  // PostgreSQL specific config for production
  ...(process.env.NODE_ENV === 'production' && {
    extra: {
      ssl: { rejectUnauthorized: false }
    }
  }),
};
