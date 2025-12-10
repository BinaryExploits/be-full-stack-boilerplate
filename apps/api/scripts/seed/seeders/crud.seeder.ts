import * as mongoose from 'mongoose';
import {
  CrudEntity,
  CrudSchema,
} from '../../../src/modules/crud/repositories/mongoose/entities/crud.entity';
import { MongooseSeeder } from './mongoose.seeder';
import { SeedLogger } from '@repo/db-seeder';
import { StringExtensions } from '@repo/utils-core';

export class CrudSeeder extends MongooseSeeder<Partial<CrudEntity>> {
  readonly entityName = 'CRUD';
  readonly seedDataFile = 'crud.json';

  constructor() {
    super(mongoose.model<CrudEntity>(CrudEntity.name, CrudSchema));
  }

  validate(): string[] {
    if (this.records.length <= 0) {
      throw new Error(`No ${this.entityName} records to validate`);
    }

    const errors: string[] = [];

    for (let index = 0; index < this.records.length; index++) {
      const record = this.records[index];

      if (!record._id) {
        errors.push(
          `${this.entityName} record at index ${index}: '_id' is required and must be non-empty`,
        );
      }

      if (StringExtensions.IsNullOrEmpty(record.content)) {
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
      await this.model.findOneAndUpdate(
        {
          _id: record._id,
        },
        {
          content: record.content,
        },
        {
          upsert: true,
        },
      );
    }

    SeedLogger.success(
      `✓ Seeded ${this.records.length} record(s)`,
      this.entityName,
    );
  }
}
