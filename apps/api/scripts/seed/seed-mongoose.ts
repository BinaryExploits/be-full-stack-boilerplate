import * as mongoose from 'mongoose';
import {
  runSeeders,
  SeederOrchestratorConfig,
  SeedLogger,
} from '@repo/db-seeder';
import { CrudSeeder } from './seeders/crud.seeder';

if (!process.env.DATABASE_URL_MONGODB) {
  throw new Error('DATABASE_URL_MONGODB is missing');
}

const mongoUri: string = process.env.DATABASE_URL_MONGODB;
const mongooseSeederConfig: SeederOrchestratorConfig = {
  seeders: [new CrudSeeder()],
  loggerPrefix: '[SEED_MONGOOSE]',
  onConnect: async () => {
    SeedLogger.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    SeedLogger.success('✓ Connected to MongoDB');
  },
  onDisconnect: async () => {
    await mongoose.disconnect();
    SeedLogger.log('Disconnected from MongoDB');
  },
};

runSeeders(mongooseSeederConfig)
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
