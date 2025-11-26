import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { SeedLogger } from "./logger";

export interface ISeeder {
  readonly entityName: string;
  readonly seedDataFile: string;

  loadData(): Promise<void>;
  validate(): string[];
  clean(): Promise<void>;
  seed(): Promise<void>;
}

export abstract class BaseSeeder<T> implements ISeeder {
  abstract readonly entityName: string;
  abstract readonly seedDataFile: string;
  protected readonly seedDataDir: string;

  protected records: T[] = [];

  protected constructor(seedDataDir: string) {
    this.seedDataDir = seedDataDir;
  }

  async loadData(): Promise<void> {
    const absoluteFilePath: string = path.join(
      this.seedDataDir,
      this.seedDataFile,
    );

    SeedLogger.log(`Loading data from ${this.seedDataFile}`, this.entityName);
    const rawJsonContent: string = await readFile(absoluteFilePath, "utf-8");
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
