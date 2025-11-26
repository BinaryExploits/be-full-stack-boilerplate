import { Crud, PrismaClient } from "../generated/prisma";
import { BaseSeeder } from "./base.seeder";
import { SeedLogger } from "./logger";

export class CrudSeeder extends BaseSeeder<Partial<Crud>> {
  readonly entityName = "CRUD";
  readonly seedFile = "crud.json";

  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  validate(): string[] {
    if (this.records.length <= 0) {
      throw new Error("No records to validate");
    }

    const errors: string[] = [];

    for (let index = 0; index < this.records.length; index++) {
      const crud = this.records[index];
      if (!crud.content || crud.content.trim().length === 0) {
        errors.push(
          `${this.entityName} record at index ${index}: 'content' is required and must be non-empty`,
        );
      }
    }

    if (errors.length === 0) {
      SeedLogger.success(
        `✓ Validated ${this.records.length} record(s)`,
        this.entityName,
      );
    }

    return errors;
  }

  async clean(): Promise<void> {
    const deletedRecords = await this.prisma.crud.deleteMany();
    SeedLogger.success(
      `✓ Cleaned ${deletedRecords.count} record(s)`,
      this.entityName,
    );
  }

  async seed(): Promise<void> {
    for (const record of this.records) {
      await this.prisma.crud.create({
        data: { content: record.content! },
      });
    }

    SeedLogger.success(
      `✓ Seeded ${this.records.length} record(s)`,
      this.entityName,
    );
  }
}
