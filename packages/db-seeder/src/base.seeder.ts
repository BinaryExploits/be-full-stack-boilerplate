import * as path from "node:path";
import * as fs from "node:fs";
import { SeedLogger } from "./logger";

/**
 * Common interface that all seeders must implement
 */
export interface ISeeder<T = any> {
  readonly entityName: string;
  readonly seedFile: string;

  loadData(): Promise<void>;
  validate(): string[];
  clean(): Promise<void>;
  seed(): Promise<void>;
}

/**
 * Abstract base class for database seeders
 * Database-agnostic - works with Prisma, Mongoose, or any other ORM
 */
export abstract class BaseSeeder<T> implements ISeeder<T> {
  abstract readonly entityName: string;
  abstract readonly seedFile: string;

  protected records: T[] = [];
  protected logger = SeedLogger;

  /**
   * Constructor accepts the seed data directory path
   * This allows different databases to have their own seed-data locations
   */
  protected constructor(protected readonly seedDataDir: string) {}

  /**
   * Loads data from JSON file
   * Common implementation for all database types
   */
  async loadData(): Promise<void> {
    const absoluteFilePath: string = path.join(this.seedDataDir, this.seedFile);

    this.logger.log(`Loading data from ${this.seedFile}`, this.entityName);
    const rawJsonContent: string = fs.readFileSync(absoluteFilePath, "utf-8");
    this.records = JSON.parse(rawJsonContent) as T[];
    this.logger.success(
      `✓ Loaded ${this.records.length} record(s)`,
      this.entityName,
    );
  }

  /**
   * Validate the loaded data
   * Must be implemented by child classes with database-specific validation
   */
  abstract validate(): string[];

  /**
   * Clean existing records from database
   * Must be implemented by child classes with database-specific cleanup logic
   */
  abstract clean(): Promise<void>;

  /**
   * Seed new records into database
   * Must be implemented by child classes with database-specific insertion logic
   */
  abstract seed(): Promise<void>;
}
