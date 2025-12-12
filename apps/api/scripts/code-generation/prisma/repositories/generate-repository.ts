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
      'repositories/prisma',
    );
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateInterface();
    this.generateRepository();

    console.log(
      `✅ Generated repository for ${this.entityNameCapitalized} in ${this.outputDir}`,
    );
  }

  private generateInterface(): void {
    const content = this.getInterfaceTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.prisma-repository.interface.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const content = this.getRepositoryTemplate();
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.prisma-repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private getInterfaceTemplate(): string {
    return `import { Prisma } from '@repo/prisma-db';

export interface I${this.entityNameCapitalized}PrismaRepository {
  create(
    args: Prisma.${this.entityNameCapitalized}CreateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}CreateArgs>>;
  createMany(args: Prisma.${this.entityNameCapitalized}CreateManyArgs): Promise<Prisma.BatchPayload>;

  findFirst(
    args?: Prisma.${this.entityNameCapitalized}FindFirstArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindFirstArgs> | null>;
  findUnique(
    args: Prisma.${this.entityNameCapitalized}FindUniqueArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindUniqueArgs> | null>;
  findMany(
    args?: Prisma.${this.entityNameCapitalized}FindManyArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindManyArgs>[]>;

  update(
    args: Prisma.${this.entityNameCapitalized}UpdateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpdateArgs>>;
  updateMany(args: Prisma.${this.entityNameCapitalized}UpdateManyArgs): Promise<Prisma.BatchPayload>;
  upsert(
    args: Prisma.${this.entityNameCapitalized}UpsertArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpsertArgs>>;

  delete(
    args: Prisma.${this.entityNameCapitalized}DeleteArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}DeleteArgs>>;
  deleteMany(args?: Prisma.${this.entityNameCapitalized}DeleteManyArgs): Promise<Prisma.BatchPayload>;

  count(args?: Prisma.${this.entityNameCapitalized}CountArgs): Promise<number>;
  aggregate(
    args: Prisma.${this.entityNameCapitalized}AggregateArgs,
  ): Promise<Prisma.Get${this.entityNameCapitalized}AggregateType<Prisma.${this.entityNameCapitalized}AggregateArgs>>;
}
`;
  }

  private getRepositoryTemplate(): string {
    return `import { Injectable } from '@nestjs/common';
import {
  TransactionHost,
  InjectTransactionHost,
} from '@nestjs-cls/transactional';
import { Prisma } from '@repo/prisma-db';
import { I${this.entityNameCapitalized}PrismaRepository } from './${this.entityName}.prisma-repository.interface';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';
import { AppConstants } from '../../../../constants/app.constants';

@Injectable()
export class ${this.entityNameCapitalized}PrismaRepository implements I${this.entityNameCapitalized}PrismaRepository {
  constructor(
    @InjectTransactionHost(AppConstants.DB_CONNECTIONS.PRISMA)
    protected readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  protected get delegate(): Prisma.${this.entityNameCapitalized}Delegate {
    return this.prismaTxHost.tx.${this.entityName};
  }

  create(
    args: Prisma.${this.entityNameCapitalized}CreateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}CreateArgs>> {
    return this.delegate.create(args);
  }

  createMany(args: Prisma.${this.entityNameCapitalized}CreateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany(args);
  }

  findFirst(
    args?: Prisma.${this.entityNameCapitalized}FindFirstArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindFirstArgs> | null> {
    return this.delegate.findFirst(args);
  }

  findUnique(
    args: Prisma.${this.entityNameCapitalized}FindUniqueArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindUniqueArgs> | null> {
    return this.delegate.findUnique(args);
  }

  findMany(
    args?: Prisma.${this.entityNameCapitalized}FindManyArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}FindManyArgs>[]> {
    return this.delegate.findMany(args);
  }

  update(
    args: Prisma.${this.entityNameCapitalized}UpdateArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpdateArgs>> {
    return this.delegate.update(args);
  }

  updateMany(args: Prisma.${this.entityNameCapitalized}UpdateManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany(args);
  }

  upsert(
    args: Prisma.${this.entityNameCapitalized}UpsertArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}UpsertArgs>> {
    return this.delegate.upsert(args);
  }

  delete(
    args: Prisma.${this.entityNameCapitalized}DeleteArgs,
  ): Promise<Prisma.${this.entityNameCapitalized}GetPayload<Prisma.${this.entityNameCapitalized}DeleteArgs>> {
    return this.delegate.delete(args);
  }

  deleteMany(args?: Prisma.${this.entityNameCapitalized}DeleteManyArgs): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany(args);
  }

  count(args?: Prisma.${this.entityNameCapitalized}CountArgs): Promise<number> {
    return this.delegate.count(args);
  }

  aggregate(
    args: Prisma.${this.entityNameCapitalized}AggregateArgs,
  ): Promise<Prisma.Get${this.entityNameCapitalized}AggregateType<Prisma.${this.entityNameCapitalized}AggregateArgs>> {
    return this.delegate.aggregate(args);
  }
}

export type { I${this.entityNameCapitalized}PrismaRepository };
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
