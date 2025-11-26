import { PrismaClient } from "./generated/prisma";
import { ISeeder } from "./seeders/base.seeder";
import { CrudSeeder } from "./seeders/crud.seeder";
import { SeedLogger } from "./seeders/logger";

const prisma = new PrismaClient();
const SEEDERS: ISeeder[] = [new CrudSeeder(prisma)];

async function loadAllData(): Promise<void> {
  SeedLogger.step(1, "Loading data for all seeders...");
  for (const seeder of SEEDERS) {
    await seeder.loadData();
  }
}

async function validateAllData(): Promise<void> {
  SeedLogger.step(2, "Validating all seed data...");
  const validationErrors: string[] = [];

  for (const seeder of SEEDERS) {
    const errors: string[] = seeder.validate();
    validationErrors.push(...errors);
  }

  if (validationErrors.length > 0) {
    SeedLogger.separator();
    for (const error of validationErrors) {
      SeedLogger.error(`✗ ${error}`);
    }
    SeedLogger.separator();
    throw new Error(
      `Validation failed with ${validationErrors.length} error(s). Fix all errors above and try again.`,
    );
  }

  SeedLogger.success("✓ All validation completed successfully");
}

async function cleanDatabase(): Promise<void> {
  SeedLogger.step(3, "Cleaning database...");
  for (const seeder of SEEDERS) {
    await seeder.clean();
  }
}

async function seedDatabase(): Promise<void> {
  SeedLogger.step(4, "Seeding database...");
  for (const seeder of SEEDERS) {
    await seeder.seed();
  }
}

async function main() {
  SeedLogger.separator();
  SeedLogger.log("Starting database seeding process...");
  SeedLogger.separator();

  await loadAllData();
  await validateAllData();
  await cleanDatabase();
  await seedDatabase();

  SeedLogger.separator();
  SeedLogger.success("✓ Database seeding completed successfully!");
  SeedLogger.separator();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    SeedLogger.separator();
    SeedLogger.error("✗ Error during seeding process:");
    console.log(error);
    SeedLogger.separator();
    await prisma.$disconnect();
    process.exit(1);
  });
