import { DataSource } from 'typeorm';
import { UserEntity } from './core/entities/user.entity';
import { TransferEntity } from './core/entities/transfer.entity';
import { DatabaseSeeder } from './database/seeders/database-seeder';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [UserEntity],
  synchronize: true,
  logging: false,
});

export async function setupTestDatabase(): Promise<DataSource> {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }

  // Run seeders
  const seeder = new DatabaseSeeder(testDataSource);
  await seeder.run();

  return testDataSource;
}

export async function teardownTestDatabase(): Promise<void> {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
}
