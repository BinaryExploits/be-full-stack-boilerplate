import * as mongoose from 'mongoose';
import * as path from 'node:path';
import { BaseSeeder } from '@repo/db-seeder';

/**
 * Mongoose-specific base seeder
 * Extends the shared base seeder with Mongoose-specific functionality
 */
export abstract class MongooseSeeder<T> extends BaseSeeder<T> {
  abstract readonly model: mongoose.Model<any>;

  constructor() {
    super(path.join(__dirname, '..', 'seed-data'));
  }
}
