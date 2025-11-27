import { PrismaClient } from "./generated/prisma";
import { CrudSeeder } from "./seeders/crud.seeder";
import {
  runSeeders,
  SeederOrchestratorConfig,
  SeedLogger,
} from "@repo/db-seeder";

const prisma = new PrismaClient();
const prismaSeederConfig: SeederOrchestratorConfig = {
  seeders: [new CrudSeeder(prisma)],
  loggerPrefix: "[SEED_PRISMA]",
  onDisconnect: async () => {
    await prisma.$disconnect();
    SeedLogger.log("Disconnected from PrismaClient");
  },
};

runSeeders(prismaSeederConfig)
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
