import * as mongoose from 'mongoose';
import {
  CrudDocument,
  CrudSchema,
} from '../../../src/database/mongoose/models/crud.model';
import { BaseSeeder, ValidationError } from './base.seeder';

export class CrudSeeder extends BaseSeeder<Partial<CrudDocument>> {
  readonly entityName = 'CRUD';
  readonly seedFile = 'crud.json';
  readonly model: mongoose.Model<CrudDocument>;

  constructor() {
    super();
    this.model = mongoose.model<CrudDocument>(CrudDocument.name, CrudSchema);
  }

  validate(): ValidationError[] {
    this.logger.log(`Validating ${this.records.length} record(s)...`);
    const errors: ValidationError[] = [];

    for (let index = 0; index < this.records.length; index++) {
      const record = this.records[index];
      if (!record.content || record.content.trim().length === 0) {
        errors.push(
          `Record at index ${index}: 'content' property is required and must be a non-empty string`,
        );
      }
    }

    this.logValidationResults(errors);
    return errors;
  }

  async clean(): Promise<void> {
    this.logger.log('Cleaning records...');
    const result = await this.model.deleteMany({});
    this.logger.log(`Deleted ${result.deletedCount} record(s)`);
  }

  async seed(): Promise<void> {
    this.logger.log(`Seeding ${this.records.length} record(s)...`);
    let createdCount = 0;

    for (const record of this.records) {
      await this.model.create({ content: record.content });
      createdCount++;
      this.logger.log(
        `✓ Created record ${createdCount}/${this.records.length}: "${record.content}"`,
      );
    }

    this.logger.log(`Successfully seeded ${createdCount} record(s)`);
  }
}

