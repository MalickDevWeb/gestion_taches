import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false, // Désactiver synchronisation pour éviter conflits
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: true, // Utiliser migrations
  extra: {
    ssl: { rejectUnauthorized: false }
  }
};
