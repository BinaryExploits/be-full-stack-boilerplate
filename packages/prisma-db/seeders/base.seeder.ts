import * as path from "node:path";
import * as fs from "node:fs";
import { SeedLogger } from "./logger";

export interface ISeeder<T = any> {
  readonly entityName: string;
  readonly seedFile: string;

  loadData(): Promise<void>;
  validate(): string[];
  clean(): Promise<void>;
  seed(): Promise<void>;
}

export abstract class BaseSeeder<T> implements ISeeder<T> {
  readonly seedDataDir: string = path.join(__dirname, "..", "seed-data");

  abstract readonly entityName: string;
  abstract readonly seedFile: string;

  protected records: T[] = [];

  async loadData(): Promise<void> {
    const absoluteFilePath: string = path.join(this.seedDataDir, this.seedFile);

    SeedLogger.log(`Loading data from ${this.seedFile}`, this.entityName);
    const rawJsonContent: string = fs.readFileSync(absoluteFilePath, "utf-8");
    this.records = JSON.parse(rawJsonContent) as T[];
    SeedLogger.success(
      `✓ Loaded ${this.records.length} record(s)`,
      this.entityName,
    );
  }

  abstract validate(): string[];
  abstract clean(): Promise<void>;
  abstract seed(): Promise<void>;
}
