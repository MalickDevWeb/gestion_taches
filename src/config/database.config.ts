import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  ...(process.env.DATABASE_URL ? {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrationsRun: process.env.NODE_ENV === 'production',
    extra: {
      ssl: { rejectUnauthorized: false }
    }
  } : {
    type: process.env.DB_TYPE === 'sqlite' ? 'sqlite' : 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrationsRun: process.env.NODE_ENV === 'production',
    // SQLite specific config
    ...(process.env.DB_TYPE === 'sqlite' && {
      database: process.env.DB_NAME || 'database.sqlite',
    }),
    // PostgreSQL specific config for production
    ...(process.env.NODE_ENV === 'production' && process.env.DB_TYPE !== 'sqlite' && {
      extra: {
        ssl: { rejectUnauthorized: false }
      }
    }),
  })
};
