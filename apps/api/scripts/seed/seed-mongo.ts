import * as mongoose from 'mongoose';
import { ISeeder, ValidationError } from './seeders/base.seeder';
import { CrudSeeder } from './seeders/crud.seeder';

const logger = {
  log: (message: unknown) => console.log(`[SEED_MONGOOSE]`, message),
  error: (message: unknown) => console.error(`[SEED_MONGOOSE]`, message),
};

// ============================================================================
// Seeder Registry - Add new seeder instances here
// ============================================================================

const SEEDERS: ISeeder[] = [
  new CrudSeeder(),
  // new UserSeeder(),
  // new PostSeeder(),
  // Add more seeders as needed...
];

// ============================================================================
// Generic Orchestrator - No changes needed when adding new seeders
// ============================================================================

async function main() {
  logger.log('Starting database seeding process...');

  if (!process.env.DATABASE_URL_MONGODB) {
    throw new Error('DATABASE_URL_MONGODB is missing');
  }

  logger.log(`Connecting to MongoDB...`);
  const mongoUri: string = process.env.DATABASE_URL_MONGODB;
  await mongoose.connect(mongoUri);
  logger.log(`Connected to MongoDB`);

  // Step 1: Load data for all seeders
  logger.log('Loading data for all seeders...');
  for (const seeder of SEEDERS) {
    await seeder.loadData();
  }

  // Step 2: Validate all seeders (collect ALL errors before breaking flow)
  logger.log('Validating all seed data...');
  const allErrors: ValidationError[] = [];

  for (const seeder of SEEDERS) {
    const errors = seeder.validate();
    allErrors.push(...errors);
  }

  // Report all errors at once if any exist
  if (allErrors.length > 0) {
    logger.error(
      `\n${'='.repeat(80)}\nValidation failed with ${allErrors.length} total error(s) across all seeders\n${'='.repeat(80)}`,
    );
    throw new Error(
      `Validation failed with ${allErrors.length} error(s). Fix all errors above and try again.`,
    );
  }

  logger.log('All validation completed successfully');

  // Step 3: Clean all seeders
  logger.log('Cleaning database...');
  for (const seeder of SEEDERS) {
    await seeder.clean();
  }

  // Step 4: Seed all seeders
  logger.log('Seeding database...');
  for (const seeder of SEEDERS) {
    await seeder.seed();
  }

  logger.log('Database seeding completed successfully!');
}

main()
  .then(async () => {
    await mongoose.disconnect();
    logger.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Error during seeding process:');
    logger.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
