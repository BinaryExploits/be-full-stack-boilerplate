import { Crud, PrismaClient } from "./generated/prisma";
import * as path from "node:path";
import * as fs from "node:fs";

const prisma = new PrismaClient();

const logger = {
  log: (message: unknown) => console.log(`[SEED_PRISMA]`, message),
  error: (message: unknown) => console.error(`[SEED_PRISMA]`, message),
};

const SEED_DATA_DIR = "seed-data";

const SEED_FILES = {
  CRUD: "crud.json",
} as const;

function loadJsonSeedFile<T>(jsonFileName: string): T[] {
  const absoluteFilePath: string = path.join(
    __dirname,
    SEED_DATA_DIR,
    jsonFileName,
  );
  logger.log(`Loading data from ${absoluteFilePath}...`);

  const rawJsonContent: string = fs.readFileSync(absoluteFilePath, "utf-8");
  return JSON.parse(rawJsonContent) as T[];
}

function validateCrudRecord(
  record: Partial<Crud>,
  index: number,
): string | null {
  if (!record.content || record.content.trim().length === 0) {
    return `Record at index ${index}: 'content' property is required and must be a non-empty string`;
  }
  return null;
}

function validateCrudRecords(crudRecords: Partial<Crud>[]): string[] {
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

async function seedCrudRecords(crudRecords: Partial<Crud>[]): Promise<void> {
  logger.log(`Seeding ${crudRecords.length} CRUD record(s)...`);

  let createdCount = 0;
  for (const crudRecord of crudRecords) {
    await prisma.crud.create({
      data: { content: crudRecord.content },
    });
    createdCount++;
    logger.log(
      `✓ Created CRUD record ${createdCount}/${crudRecords.length}: "${crudRecord.content}"`,
    );
  }

  logger.log(`Successfully seeded ${createdCount} CRUD record(s)`);
}

async function cleanCrudRecords(): Promise<void> {
  logger.log("Cleaning CRUD records...");
  const deletedRecords = await prisma.crud.deleteMany();
  logger.log(`Deleted ${deletedRecords.count} CRUD record(s)`);
}

async function cleanDatabase(): Promise<void> {
  logger.log("Cleaning database...");
  await cleanCrudRecords();
}

function validateSeedData(crudRecords: Partial<Crud>[]): void {
  logger.log("Validating seed data...");

  const validationErrors: string[] = [];

  const crudErrors: string[] = validateCrudRecords(crudRecords);
  validationErrors.push(...crudErrors);

  if (validationErrors.length > 0) {
    throw new Error(
      `Validation failed with ${validationErrors.length} error(s)`,
    );
  }

  logger.log(`Validation completed successfully`);
}

async function seedDatabase(crudRecords: Partial<Crud>[]): Promise<void> {
  logger.log("Seeding database...");
  await seedCrudRecords(crudRecords);
}

async function main() {
  logger.log("Starting database seeding process...");

  const crudRecords: Partial<Crud>[] = loadJsonSeedFile(SEED_FILES.CRUD);
  validateSeedData(crudRecords);

  await cleanDatabase();
  await seedDatabase(crudRecords);

  logger.log("Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error("Error during seeding process:");
    logger.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
