const { execSync } = require("child_process");
const { existsSync, copyFileSync } = require("fs");

let currentStep = "";
let stepNumber = 0;

function run(command, options = {}) {
  console.log(`\nRunning: ${command}`);
  execSync(command, { stdio: "inherit", shell: true, ...options });
}

function logStep() {
  console.log("\n==============================");
  console.log(`Step ${++stepNumber}: ${currentStep}`);
  console.log("==============================");
}

try {
  currentStep = "Installing dependencies";
  logStep();
  run("npm install -g pnpm");
  run("pnpm install");

  currentStep = "Setting up environment files";
  logStep();
  const envFiles = [
    "apps/api/.env",
    "apps/web/.env",
    "apps/mobile/.env",
    "packages/prisma-db/.env",
    "packages/sonarqube/.env",
  ];

  envFiles.forEach((file) => {
    const exampleFile = `${file}.example`;
    if (!existsSync(file) && existsSync(exampleFile)) {
      console.log(`Copying ${exampleFile} → ${file}`);
      copyFileSync(exampleFile, file);
    } else if (!existsSync(exampleFile)) {
      console.warn(`Example file missing: ${exampleFile}, skipping copy`);
    } else {
      console.log(`${file} already exists, skipping copy`);
    }
  });

  currentStep = "Starting Docker containers";
  logStep();

  console.log("\nMongoDB:");
  run("docker-compose -f apps/api/docker-compose.mongo.yml down -v");
  run("docker-compose -f apps/api/docker-compose.mongo.yml up -d");

  console.log("\nPostgreSQL:");
  run("docker-compose -f apps/api/docker-compose.pg.yml down -v");
  run("docker-compose -f apps/api/docker-compose.pg.yml up -d");

  currentStep = "Running Prisma setup (PostgreSQL)";
  logStep();
  const prismaDir = "packages/prisma-db";
  run("pnpm prisma generate", { cwd: prismaDir });
  run("pnpm prisma migrate deploy", { cwd: prismaDir });

  currentStep = "Building projects";
  logStep();
  run("pnpm build");
  console.log("Projects built successfully.");

  currentStep = "Seeding Database(s)";
  logStep();
  run("pnpm run db:seed:all", { cwd: "apps/api" });

  currentStep = "Setup Complete";
  logStep();
  console.log("All dependencies installed, Docker containers running, Prisma setup done.");
  console.log("You can now run 'pnpm dev' from the root to start all apps.");
} catch (error) {
  console.error(`\nSetup failed at step: ${currentStep}`);
  console.error(error.message);
  process.exit(1);
}
