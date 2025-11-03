import { AppDataSource } from '../config/data-source';
import { DatabaseSeeder } from './seeders/database-seeder';

async function runSeeders() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');

    const seeder = new DatabaseSeeder(AppDataSource);
    await seeder.run();

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeders();
