import * as mongoose from 'mongoose';
import * as path from 'node:path';
import { BaseSeeder } from '@repo/db-seeder';

export abstract class MongooseSeeder<T> extends BaseSeeder<T> {
  abstract readonly model: mongoose.Model<any>;

  protected constructor() {
    super(path.join(__dirname, '..', 'seed-data'));
  }
}
