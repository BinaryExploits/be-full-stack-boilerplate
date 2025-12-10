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
      '../../src/modules',
      this.entityName,
      'repositories/mongoose',
    );
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const entitiesDir = path.join(this.outputDir, 'entities');
    if (!fs.existsSync(entitiesDir)) {
      fs.mkdirSync(entitiesDir, { recursive: true });
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
      'entities',
      `${this.entityName}.entity.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const content = this.getRepositoryTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongo.repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private getEntityTemplate(): string {
    return `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseEntity } from '../../../../../repositories/mongoose/base.mongo.entity';

@Schema({ collection: '${this.entityName}', timestamps: true })
export class ${this.entityNameCapitalized}Entity extends MongooseEntity {}

export const ${this.entityNameCapitalized}Schema = SchemaFactory.createForClass(${this.entityNameCapitalized}Entity);
`;
  }

  private getRepositoryTemplate(): string {
    return `import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { BaseRepositoryMongo } from '../../../../repositories/mongoose/interfaces/base.abstract.repository';
import { ${this.entityNameCapitalized}Entity } from './entities/${this.entityName}.entity';
import { ${this.entityNameCapitalized} } from '../../schemas/${this.entityName}.schema';

@Injectable()
export class ${this.entityNameCapitalized}MongoRepository extends BaseRepositoryMongo<
  ${this.entityNameCapitalized},
  ${this.entityNameCapitalized}Entity
> {
  constructor(
    @InjectModel(${this.entityNameCapitalized}Entity.name)
    ${this.entityName}Model: Model<${this.entityNameCapitalized}Entity>,
    @InjectTransactionHost(MongooseModule.name)
    mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(${this.entityName}Model, mongoTxHost);
  }

  protected toDomainEntity(dbEntity: ${this.entityNameCapitalized}Entity): ${this.entityNameCapitalized} {
    throw new Error('Method not implemented.');
    
    // Complete Conversion Below
    // return {
    //   id: dbEntity._id?.toString() ?? '',
    // };
  }
}
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
