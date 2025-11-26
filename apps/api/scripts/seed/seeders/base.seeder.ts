import * as mongoose from 'mongoose';
import * as path from 'node:path';
import * as fs from 'node:fs';

export type ValidationError = string;

export interface ISeeder<T = any> {
  readonly entityName: string;
  readonly seedFile: string;
  readonly model: mongoose.Model<any>;

  loadData(): Promise<void>;
  validate(): ValidationError[];
  clean(): Promise<void>;
  seed(): Promise<void>;
}

export abstract class BaseSeeder<T> implements ISeeder<T> {
  abstract readonly entityName: string;
  abstract readonly seedFile: string;
  abstract readonly model: mongoose.Model<any>;

  protected records: T[] = [];

  protected logger = {
    log: (message: unknown) =>
      console.log(`[SEED_MONGOOSE][${this.entityName}]`, message),
    error: (message: unknown) =>
      console.error(`[SEED_MONGOOSE][${this.entityName}]`, message),
  };

  async loadData(): Promise<void> {
    const SEED_DATA_DIR = 'seed-data';
    const absoluteFilePath: string = path.join(
      __dirname,
      '..',
      SEED_DATA_DIR,
      this.seedFile,
    );

    this.logger.log(`Loading data from ${absoluteFilePath}...`);
    const rawJsonContent: string = fs.readFileSync(absoluteFilePath, 'utf-8');
    this.records = JSON.parse(rawJsonContent) as T[];
    this.logger.log(`Loaded ${this.records.length} record(s)`);
  }

  abstract validate(): ValidationError[];
  abstract clean(): Promise<void>;
  abstract seed(): Promise<void>;

  protected logValidationResults(errors: ValidationError[]): void {
    if (errors.length > 0) {
      this.logger.error(
        `Validation failed with ${errors.length} error(s) out of ${this.records.length} record(s):`,
      );
      errors.forEach((error) => this.logger.error(`✗ ${error}`));
    } else {
      this.logger.log(
        `Validation successful for ${this.records.length} record(s)`,
      );
    }
  }
}
