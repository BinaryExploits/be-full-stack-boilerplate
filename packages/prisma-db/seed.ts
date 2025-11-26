import { Crud, PrismaClient } from "./generated/prisma";
import * as path from "node:path";
import * as fs from "node:fs";

const prisma = new PrismaClient();

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
  console.log(`[SEED] Loading data from ${absoluteFilePath}...`);

  const rawJsonContent: string = fs.readFileSync(absoluteFilePath, "utf-8");
  return JSON.parse(rawJsonContent);
}

function validateCrudRecord(
  record: Partial<Crud>,
  index: number,
): string | null {
  if (
    !record.content ||
    typeof record.content !== "string" ||
    record.content.trim().length === 0
  ) {
    return `Record at index ${index}: 'content' property is required and must be a non-empty string`;
  }
  return null;
}

function validateCrudRecords(crudRecords: Partial<Crud>[]): string[] {
  console.log(`[SEED] Validating ${crudRecords.length} CRUD record(s)...`);
  const validationErrors: string[] = [];

  for (let index = 0; index < crudRecords.length; index++) {
    const error = validateCrudRecord(crudRecords[index], index);
    if (error) {
      validationErrors.push(error);
    }
  }

  if (validationErrors.length > 0) {
    console.error(
      `[SEED] CRUD validation failed with ${validationErrors.length} error(s):`,
    );
    for (const error of validationErrors) {
      console.error(`[SEED] ✗ ${error}`);
    }
  } else {
    console.log(`[SEED] CRUD validation successful`);
  }

  return validationErrors;
}

async function seedCrudRecords(crudRecords: Partial<Crud>[]): Promise<void> {
  console.log(`[SEED] Seeding ${crudRecords.length} CRUD record(s)...`);

  let createdCount = 0;
  for (const crudRecord of crudRecords) {
    await prisma.crud.create({
      data: { content: crudRecord.content },
    });
    createdCount++;
    console.log(
      `[SEED] ✓ Created CRUD record ${createdCount}/${crudRecords.length}: "${crudRecord.content}"`,
    );
  }

  console.log(`[SEED] Successfully seeded ${createdCount} CRUD record(s)`);
}

async function cleanCrudRecords(): Promise<void> {
  console.log("[SEED] Cleaning CRUD records...");
  const deletedRecords = await prisma.crud.deleteMany();
  console.log(`[SEED] Deleted ${deletedRecords.count} CRUD record(s)`);
}

async function cleanDatabase(): Promise<void> {
  console.log("[SEED] Cleaning database...");
  await cleanCrudRecords();
}

async function validateSeedData(crudRecords: Partial<Crud>[]): Promise<void> {
  console.log("[SEED] Validating seed data...");

  const validationErrors = validateCrudRecords(crudRecords);

  if (validationErrors.length > 0) {
    throw new Error(
      `Validation failed with ${validationErrors.length} error(s)`,
    );
  }

  console.log(`[SEED] Validation completed successfully`);
}

async function seedDatabase(crudRecords: Partial<Crud>[]): Promise<void> {
  console.log("[SEED] Seeding database...");
  await seedCrudRecords(crudRecords);
}

async function main() {
  console.log("[SEED] Starting database seeding process...");

  const crudRecords: Partial<Crud>[] = loadJsonSeedFile(SEED_FILES.CRUD);

  await cleanDatabase();
  await validateSeedData(crudRecords);
  await seedDatabase(crudRecords);

  console.log("[SEED] Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[SEED] Error during seeding process:");
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
