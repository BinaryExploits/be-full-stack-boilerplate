import * as fs from 'node:fs';
import * as path from 'node:path';
import { NamingUtil } from '../../utils/naming.util';

interface GeneratorConfig {
  entityName: string;
  /** If true (default), generates tenant-scoped repository with TenantContext. Use false for global entities. */
  tenantScoped?: boolean;
}

export class RepositoryGenerator {
  private readonly entityNameKebab: string;
  private readonly entityNamePascal: string;
  private readonly entityNameCamel: string;
  private readonly outputDir: string;
  private readonly templatesDir: string;
  private readonly tenantScoped: boolean;

  constructor(config: GeneratorConfig) {
    this.entityNameKebab = NamingUtil.toKebabCase(config.entityName);
    this.entityNamePascal = NamingUtil.toPascalCase(config.entityName);
    this.entityNameCamel = NamingUtil.toCamelCase(config.entityName);
    this.tenantScoped = config.tenantScoped !== false;

    this.outputDir = path.join(
      __dirname,
      '../../../../src/modules',
      this.entityNameKebab,
      'repositories/mongoose',
    );
    this.templatesDir = path.join(__dirname, 'templates');
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateEntity();
    this.generateRepository();

    console.log(
      `✅ Generated ${this.tenantScoped ? 'tenant-scoped ' : ''}repository for ${this.entityNamePascal} in ${this.outputDir}`,
    );
  }

  private generateEntity(): void {
    const content = this.loadTemplate('entity.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityNameKebab}.mongoose-entity.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const templateName = this.tenantScoped
      ? 'repository.template.txt'
      : 'repository.global.template.txt';
    const content = this.loadTemplate(templateName);
    const filePath = path.join(
      this.outputDir,
      `${this.entityNameKebab}.mongoose-repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');

    template = template.replaceAll(
      '{{ENTITY_NAME_PASCAL}}',
      this.entityNamePascal,
    );
    template = template.replaceAll(
      '{{ENTITY_NAME_KEBAB}}',
      this.entityNameKebab,
    );
    template = template.replaceAll(
      '{{ENTITY_NAME_CAMEL}}',
      this.entityNameCamel,
    );

    return template;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const entityName = args[0];
  const tenantScoped =
    !args.includes('--no-tenant') && !args.includes('--global');

  if (!entityName) {
    console.error(
      '❌ Usage: pnpm run generate:repo:mongo <entityName> [--no-tenant]',
    );
    console.error('   Example: pnpm run generate:repo:mongo crud');
    console.error('   Example: pnpm run generate:repo:mongo post');
    console.error(
      '   Example: pnpm run generate:repo:mongo global-crud --no-tenant',
    );
    process.exit(1);
  }

  const generator = new RepositoryGenerator({
    entityName,
    tenantScoped,
  });

  generator.generate();
}
