import { DataSource } from 'typeorm';
import { UserSeeder } from './user.seeder';
import { TransferSeeder } from './transfer.seeder';

export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      // Run user seeder first
      const userSeeder = new UserSeeder(this.dataSource);
      await userSeeder.run();
      console.log('User seeding completed.');

      // Only run transfer seeder if not in test environment (SQLite doesn't support jsonb)
      if (process.env.NODE_ENV !== 'test') {
        const transferSeeder = new TransferSeeder(this.dataSource);
        await transferSeeder.run();
        console.log('Transfer seeding completed.');
      }

      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}
