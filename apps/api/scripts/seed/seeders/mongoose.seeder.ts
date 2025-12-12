import * as mongoose from 'mongoose';
import * as path from 'node:path';
import { BaseSeeder } from '@repo/db-seeder';

export abstract class MongooseSeeder<T> extends BaseSeeder<T> {
  protected readonly model: mongoose.Model<T>;

  protected constructor(model: mongoose.Model<T>) {
    super(path.join(__dirname, '..', 'seed-data'));
    this.model = model;
  }
}
