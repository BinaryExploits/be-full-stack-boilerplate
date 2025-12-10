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
      'repositories/prisma',
    );
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateInterface();
    this.generateAbstractClass();
    this.generateImplementation();

    console.log(
      `✅ Generated repository for ${this.entityNameCapitalized} in ${this.outputDir}`,
    );
  }

  private generateInterface(): void {
    const content = this.getInterfaceTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.repository.interface.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateAbstractClass(): void {
    const content = this.getAbstractClassTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.repository.abstract.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateImplementation(): void {
    const content = this.getImplementationTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private getInterfaceTemplate(): string {
    return `import { Prisma } from '@repo/prisma-db';

export interface ${this.entityNameCapitalized}RepositoryInterface {
  create(
    args: Prisma.${this.entityNameCapitalized}CreateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}CreateArgs>>;
  createMany(
    args: Prisma.${this.entityNameCapitalized}CreateManyArgs,
  ): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.${this.entityNameCapitalized}FindFirstArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindFirstArgs> | null>;
  findFirstOrThrow(
    args?: Prisma.${this.entityNameCapitalized}FindFirstArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindFirstArgs>>;
  findUnique(
    args: Prisma.${this.entityNameCapitalized}FindUniqueArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindUniqueArgs> | null>;
  findUniqueOrThrow(
    args: Prisma.${this.entityNameCapitalized}FindUniqueArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindUniqueArgs>>;
  findMany(
    args?: Prisma.${this.entityNameCapitalized}FindManyArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindManyArgs>[]>;

  update(
    args: Prisma.${this.entityNameCapitalized}UpdateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpdateArgs>>;
  updateMany(
    args: Prisma.${this.entityNameCapitalized}UpdateManyArgs,
  ): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.${this.entityNameCapitalized}UpsertArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpsertArgs>>;

  delete(
    args: Prisma.${this.entityNameCapitalized}DeleteArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}DeleteArgs>>;
  deleteMany(
    args?: Prisma.${this.entityNameCapitalized}DeleteManyArgs,
  ): Promise<Prisma.BatchPayload>;

  count(
    args?: Prisma.${this.entityNameCapitalized}CountArgs,
  ): Promise<number>;
  aggregate(
    args: Prisma.${this.entityNameCapitalized}AggregateArgs,
  ): Promise<Prisma.Get${this.entityNameCapitalized}AggregateType<Prisma.${this.entityNameCapitalized}AggregateArgs>>;
}
`;
  }

  private getAbstractClassTemplate(): string {
    return `import { TransactionHost } from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { ${this.entityNameCapitalized}RepositoryInterface } from './${this.entityName}.repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';

export abstract class ${this.entityNameCapitalized}RepositoryAbstract
  implements ${this.entityNameCapitalized}RepositoryInterface
{
  protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>;

  protected constructor(
    prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {
    this.prismaTxHost = prismaTxHost;
  }

  protected get delegate() {
    return this.prismaTxHost.tx.${this.entityName};
  }

  create(args: Prisma.${this.entityNameCapitalized}CreateArgs) {
    return this.delegate.create(args);
  }

  createMany(args: Prisma.${this.entityNameCapitalized}CreateManyArgs) {
    return this.delegate.createMany(args);
  }

  findFirst(args?: Prisma.${this.entityNameCapitalized}FindFirstArgs) {
    return this.delegate.findFirst(args);
  }

  findFirstOrThrow(args?: Prisma.${this.entityNameCapitalized}FindFirstArgs) {
    return this.delegate.findFirstOrThrow(args);
  }

  findUnique(args: Prisma.${this.entityNameCapitalized}FindUniqueArgs) {
    return this.delegate.findUnique(args);
  }

  findUniqueOrThrow(args: Prisma.${this.entityNameCapitalized}FindUniqueArgs) {
    return this.delegate.findUniqueOrThrow(args);
  }

  findMany(args?: Prisma.${this.entityNameCapitalized}FindManyArgs) {
    return this.delegate.findMany(args);
  }

  update(args: Prisma.${this.entityNameCapitalized}UpdateArgs) {
    return this.delegate.update(args);
  }

  updateMany(args: Prisma.${this.entityNameCapitalized}UpdateManyArgs) {
    return this.delegate.updateMany(args);
  }

  upsert(args: Prisma.${this.entityNameCapitalized}UpsertArgs) {
    return this.delegate.upsert(args);
  }

  delete(args: Prisma.${this.entityNameCapitalized}DeleteArgs) {
    return this.delegate.delete(args);
  }

  deleteMany(args?: Prisma.${this.entityNameCapitalized}DeleteManyArgs) {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.${this.entityNameCapitalized}CountArgs) {
    return this.delegate.count(args);
  }

  aggregate(args: Prisma.${this.entityNameCapitalized}AggregateArgs) {
    return this.delegate.aggregate(args);
  }
}
`;
  }

  private getImplementationTemplate(): string {
    return `import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ${this.entityNameCapitalized}RepositoryAbstract } from './${this.entityName}.repository.abstract';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';

@Injectable()
export class ${this.entityNameCapitalized}Repository extends ${this.entityNameCapitalized}RepositoryAbstract {
  constructor(prismaTxHost: TransactionHost<PrismaTransactionAdapter>) {
    super(prismaTxHost);
  }
}
`;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const entityName = args[0];

  if (!entityName) {
    console.error('❌ Usage: pnpm run generate:repo:prisma <entityName>');
    console.error('   Example: pnpm run generate:repo:prisma crud');
    process.exit(1);
  }

  const generator = new RepositoryGenerator({
    entityName,
  });

  generator.generate();
}
