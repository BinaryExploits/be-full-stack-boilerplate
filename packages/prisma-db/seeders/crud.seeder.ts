import { Crud } from "../generated/prisma";
import { PrismaSeeder } from "./prisma.seeder";

export class CrudSeeder extends PrismaSeeder<Partial<Crud>> {
  readonly entityName = "CRUD";
  readonly seedFile = "crud.json";

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
      this.logger.success(
        `✓ Validated ${this.records.length} record(s)`,
        this.entityName,
      );
    }

    return errors;
  }

  async clean(): Promise<void> {
    const deletedRecords = await this.prisma.crud.deleteMany();
    this.logger.success(
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

    this.logger.success(
      `✓ Seeded ${this.records.length} record(s)`,
      this.entityName,
    );
  }
}
