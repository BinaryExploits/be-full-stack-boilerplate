import * as path from 'node:path';
import * as fs from 'node:fs';
import * as mongoose from 'mongoose';
import { CrudDocument, CrudSchema } from './models/crud.model';

const logger = {
  log: (message: unknown) => console.log(`[SEED_MONGOOSE]`, message),
  error: (message: unknown) => console.error(`[SEED_MONGOOSE]`, message),
};

const SEED_DATA_DIR = 'seed-data';

const SEED_FILES = {
  CRUD: 'crud.json',
} as const;

function loadJsonSeedFile<T>(jsonFileName: string): T[] {
  const absoluteFilePath: string = path.join(
    __dirname,
    SEED_DATA_DIR,
    jsonFileName,
  );
  logger.log(`Loading data from ${absoluteFilePath}...`);

  const rawJsonContent: string = fs.readFileSync(absoluteFilePath, 'utf-8');
  return JSON.parse(rawJsonContent) as T[];
}

function validateCrudRecord(
  record: Partial<CrudDocument>,
  index: number,
): string | null {
  if (!record.content || record.content.trim().length === 0) {
    return `Record at index ${index}: 'content' property is required and must be a non-empty string`;
  }
  return null;
}

function validateCrudRecords(crudRecords: Partial<CrudDocument>[]): string[] {
  logger.log(`Validating ${crudRecords.length} CRUD record(s)...`);
  const validationErrors: string[] = [];

  for (let index = 0; index < crudRecords.length; index++) {
    const error = validateCrudRecord(crudRecords[index], index);
    if (error) {
      validationErrors.push(error);
    }
  }

  if (validationErrors.length > 0) {
    logger.error(
      `CRUD validation failed with ${validationErrors.length} error(s):`,
    );
    for (const error of validationErrors) {
      logger.error(`✗ ${error}`);
    }
  } else {
    logger.log(`CRUD validation successful`);
  }

  return validationErrors;
}

async function seedCrudRecords(
  crudModel: mongoose.Model<CrudDocument>,
  crudRecords: Partial<CrudDocument>[],
): Promise<void> {
  logger.log(`Seeding ${crudRecords.length} CRUD record(s)...`);

  let createdCount = 0;
  for (const crudRecord of crudRecords) {
    await crudModel.create({ content: crudRecord.content });
    createdCount++;
    logger.log(
      `✓ Created CRUD record ${createdCount}/${crudRecords.length}: "${crudRecord.content}"`,
    );
  }

  logger.log(`Successfully seeded ${createdCount} CRUD record(s)`);
}

async function cleanCrudRecords(
  crudModel: mongoose.Model<CrudDocument>,
): Promise<void> {
  logger.log('Cleaning CRUD records...');
  const result = await crudModel.deleteMany({});
  logger.log(`Deleted ${result.deletedCount} CRUD record(s)`);
}

async function cleanDatabase(
  crudModel: mongoose.Model<CrudDocument>,
): Promise<void> {
  logger.log('Cleaning database...');
  await cleanCrudRecords(crudModel);
}

function validateSeedData(crudRecords: Partial<CrudDocument>[]): void {
  logger.log('Validating seed data...');

  const validationErrors: string[] = [];

  const crudErrors = validateCrudRecords(crudRecords);
  validationErrors.push(...crudErrors);

  if (validationErrors.length > 0) {
    throw new Error(
      `Validation failed with ${validationErrors.length} error(s)`,
    );
  }

  logger.log(`Validation completed successfully`);
}

async function seedDatabase(
  crudModel: mongoose.Model<CrudDocument>,
  crudRecords: Partial<CrudDocument>[],
): Promise<void> {
  logger.log('Seeding database...');
  await seedCrudRecords(crudModel, crudRecords);
}

async function main() {
  logger.log('Starting database seeding process...');

  if (!process.env.DATABASE_URL_MONGODB) {
    throw new Error('DATABASE_URL_MONGODB is missing');
  }

  logger.log(`Connecting to MongoDB...`);
  const mongoUri: string = process.env.DATABASE_URL_MONGODB;
  await mongoose.connect(mongoUri);
  logger.log(`Connected to MongoDB`);

  const crudRecords: Partial<CrudDocument>[] = loadJsonSeedFile(
    SEED_FILES.CRUD,
  );

  validateSeedData(crudRecords);

  const crudModel = mongoose.model<CrudDocument>(CrudDocument.name, CrudSchema);
  await cleanDatabase(crudModel);
  await seedDatabase(crudModel, crudRecords);

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
