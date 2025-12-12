import * as fs from 'fs';
import * as path from 'path';

interface GeneratorConfig {
  entityName: string;
}

export class RepositoryGenerator {
  private readonly entityName: string;
  private readonly entityNameCapitalized: string;
  private readonly outputDir: string;

  constructor(config: GeneratorConfig) {
    this.entityName = config.entityName.toLowerCase();
    this.entityNameCapitalized =
      this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1);
    this.outputDir = path.join(
      __dirname,
      '../../../../src/modules',
      this.entityName,
      'repositories/mongoose',
    );
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateEntity();
    this.generateRepository();

    console.log(
      `✅ Generated repository for ${this.entityNameCapitalized} in ${this.outputDir}`,
    );
  }

  private generateEntity(): void {
    const content = this.getEntityTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongoose-entity.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const content = this.getRepositoryTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongoose-repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private getEntityTemplate(): string {
    return `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseEntity } from '../../../../repositories/mongoose/mongoose.base-entity';

@Schema({ collection: '${this.entityName}', timestamps: true })
export class ${this.entityNameCapitalized}MongooseEntity extends MongooseBaseEntity {}

export const ${this.entityNameCapitalized}MongooseSchema = SchemaFactory.createForClass(${this.entityNameCapitalized}MongooseEntity);
`;
  }

  private getRepositoryTemplate(): string {
    return `import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { MongooseBaseRepository } from '../../../../repositories/mongoose/mongoose.base-repository';
import { IMongooseRepository } from '../../../../repositories/mongoose/mongoose.repository.interface';
import { ${this.entityNameCapitalized}MongooseEntity } from './${this.entityName}.mongoose-entity';
import { ${this.entityNameCapitalized} } from '../../schemas/${this.entityName}.schema';
import { AppConstants } from '../../../../constants/app.constants';

@Injectable()
export class ${this.entityNameCapitalized}MongooseRepository extends MongooseBaseRepository<
  ${this.entityNameCapitalized},
  ${this.entityNameCapitalized}MongooseEntity
> {
  constructor(
    @InjectModel(${this.entityNameCapitalized}MongooseEntity.name)
    ${this.entityName}Model: Model<${this.entityNameCapitalized}MongooseEntity>,
    @InjectTransactionHost(AppConstants.DB_CONNECTIONS.MONGOOSE)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(${this.entityName}Model, mongoTxHost);
  }

  protected toDomainEntity(dbEntity: ${this.entityNameCapitalized}MongooseEntity): ${this.entityNameCapitalized} {
    throw new Error('Method not implemented.');

    // Complete Conversion Below
    // return {
    //   id: dbEntity._id?.toString() ?? '',
    // };
  }
}

export type I${this.entityNameCapitalized}MongooseRepository = IMongooseRepository<
  ${this.entityNameCapitalized},
  ${this.entityNameCapitalized}MongooseEntity
>;
`;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const entityName = args[0];

  if (!entityName) {
    console.error('❌ Usage: pnpm run generate:repo:mongo <entityName>');
    console.error('   Example: pnpm run generate:repo:mongo crud');
    process.exit(1);
  }

  const generator = new RepositoryGenerator({
    entityName,
  });

  generator.generate();
}
