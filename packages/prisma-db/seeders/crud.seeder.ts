import { Crud } from "../generated/prisma";
import { PrismaSeeder } from "./prisma.seeder";
import { SeedLogger } from "@repo/db-seeder";
import { StringExtensions } from "@repo/utils-core";

export class CrudSeeder extends PrismaSeeder<Partial<Crud>> {
  readonly entityName = "CRUD";
  readonly seedDataFile = "crud.json";

  validate(): string[] {
    if (this.records.length <= 0) {
      throw new Error(`No ${this.entityName} records to validate`);
    }

    const errors: string[] = [];

    for (let index = 0; index < this.records.length; index++) {
      const crud = this.records[index];

      if (StringExtensions.IsNullOrEmpty(crud.id)) {
        errors.push(
          `${this.entityName} record at index ${index}: 'id' is required and must be non-empty`,
        );
      }

      if (StringExtensions.IsNullOrEmpty(crud.content)) {
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

  async seed(): Promise<void> {
    for (const record of this.records) {
      await this.prisma.crud.upsert({
        where: {
          id: record.id,
        },
        create: {
          id: record.id,
          content: record.content,
        },
        update: {
          content: record.content,
        },
      });
    }

    SeedLogger.success(
      `✓ Seeded ${this.records.length} record(s)`,
      this.entityName,
    );
  }
}
