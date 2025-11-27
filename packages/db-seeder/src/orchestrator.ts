import { ISeeder } from "./base.seeder";
import { SeedLogger } from "./logger";

export interface SeederOrchestratorConfig {
  /**
   * List of seeder instances to run
   */
  seeders: ISeeder[];

  /**
   * Optional callback to connect to database
   * Called before seeding starts
   */
  onConnect?: () => Promise<void>;

  /**
   * Optional callback to disconnect from database
   * Called after seeding completes or fails
   */
  onDisconnect?: () => Promise<void>;

  /**
   * Custom logger prefix (e.g., "SEED_PRISMA", "SEED_MONGOOSE")
   * Defaults to "[DB_SEED]"
   */
  loggerPrefix?: string;
}

export class SeederOrchestrator {
  private readonly seeders: ISeeder[];
  private readonly onConnect?: () => Promise<void>;
  private readonly onDisconnect?: () => Promise<void>;

  constructor(config: SeederOrchestratorConfig) {
    this.seeders = config.seeders;
    this.onConnect = config.onConnect;
    this.onDisconnect = config.onDisconnect;

    if (config.loggerPrefix) {
      SeedLogger.setPrefix(config.loggerPrefix);
    }
  }

  /**
   * Run the complete seeding process
   */
  async run(): Promise<void> {
    SeedLogger.separator();
    SeedLogger.log("Starting database seeding process...");
    SeedLogger.separator();

    if (this.onConnect) {
      await this.onConnect();
    }

    try {
      await this.loadAllData();
      this.validateAllData();
      await this.cleanDatabase();
      await this.seedDatabase();

      SeedLogger.separator();
      SeedLogger.success("✓ Database seeding completed successfully!");
      SeedLogger.separator();
    } catch (error) {
      SeedLogger.separator();
      SeedLogger.error("✗ Error during seeding process:");
      SeedLogger.error(error);
      SeedLogger.separator();
      throw error;
    } finally {
      if (this.onDisconnect) {
        await this.onDisconnect();
      }
    }
  }

  /**
   * Load data for all seeders
   */
  private async loadAllData(): Promise<void> {
    SeedLogger.step(1, "Loading data for all seeders...");
    for (const seeder of this.seeders) {
      await seeder.loadData();
    }
  }

  /**
   * Validate all seeder data
   * Collects all errors before throwing
   */
  private validateAllData(): void {
    SeedLogger.step(2, "Validating all seed data...");
    const validationErrors: string[] = [];

    for (const seeder of this.seeders) {
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

  /**
   * Clean database for all seeders
   */
  private async cleanDatabase(): Promise<void> {
    SeedLogger.step(3, "Cleaning database...");
    for (const seeder of this.seeders) {
      await seeder.clean?.();
    }
  }

  /**
   * Seed database for all seeders
   */
  private async seedDatabase(): Promise<void> {
    SeedLogger.step(4, "Seeding database...");
    for (const seeder of this.seeders) {
      await seeder.seed();
    }
  }
}

export async function runSeeders(
  config: SeederOrchestratorConfig,
): Promise<void> {
  const orchestrator = new SeederOrchestrator(config);
  await orchestrator.run();
}
