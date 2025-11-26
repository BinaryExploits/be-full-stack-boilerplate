import * as mongoose from 'mongoose';
import {
  CrudDocument,
  CrudSchema,
} from '@/database/mongoose/models/crud.model';
import { MongooseSeeder } from './mongoose.seeder';

export class CrudSeeder extends MongooseSeeder<Partial<CrudDocument>> {
  readonly entityName = 'CRUD';
  readonly seedDataFile = 'crud.json';
  readonly model: mongoose.Model<CrudDocument>;

  constructor() {
    super();
    this.model = mongoose.model<CrudDocument>(CrudDocument.name, CrudSchema);
  }

  validate(): string[] {
    if (this.records.length <= 0) {
      throw new Error(`No ${this.entityName} records to validate`);
    }

    const errors: string[] = [];

    for (let index = 0; index < this.records.length; index++) {
      const record = this.records[index];
      if (!record.content || record.content.trim().length === 0) {
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
    const result = await this.model.deleteMany();
    this.logger.success(
      `✓ Cleaned ${result.deletedCount} record(s)`,
      this.entityName,
    );
  }

  async seed(): Promise<void> {
    for (const record of this.records) {
      await this.model.create({ content: record.content });
    }

    this.logger.success(
      `✓ Seeded ${this.records.length} record(s)`,
      this.entityName,
    );
  }
}
