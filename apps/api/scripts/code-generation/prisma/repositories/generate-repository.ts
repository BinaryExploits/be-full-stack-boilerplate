import * as fs from 'fs';
import * as path from 'path';
import { NamingUtil } from '../../utils/naming.util';

interface GeneratorConfig {
  entityName: string;
}

export class RepositoryGenerator {
  private readonly entityNameKebab: string;
  private readonly entityNamePascal: string;
  private readonly entityNameCamel: string;
  private readonly outputDir: string;
  private readonly templatesDir: string;

  constructor(config: GeneratorConfig) {
    this.entityNameKebab = NamingUtil.toKebabCase(config.entityName);
    this.entityNamePascal = NamingUtil.toPascalCase(config.entityName);
    this.entityNameCamel = NamingUtil.toCamelCase(config.entityName);

    this.outputDir = path.join(
      __dirname,
      '../../../../src/modules',
      this.entityNameKebab,
      'repositories/prisma',
    );
    this.templatesDir = path.join(__dirname, 'templates');
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateInterface();
    this.generateRepository();

    console.log(
      `✅ Generated repository for ${this.entityNamePascal} in ${this.outputDir}`,
    );
  }

  private generateInterface(): void {
    const content = this.loadTemplate('interface.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityNameKebab}.prisma-repository.interface.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const content = this.loadTemplate('repository.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityNameKebab}.prisma-repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');

    template = template.replace(
      /{{ENTITY_NAME_PASCAL}}/g,
      this.entityNamePascal,
    );
    template = template.replace(/{{ENTITY_NAME_KEBAB}}/g, this.entityNameKebab);
    template = template.replace(/{{ENTITY_NAME_CAMEL}}/g, this.entityNameCamel);

    return template;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const entityName = args[0];

  if (!entityName) {
    console.error('❌ Usage: pnpm run generate:repo:prisma <entityName>');
    console.error('   Example: pnpm run generate:repo:prisma crud');
    console.error('   Example: pnpm run generate:repo:prisma data-provider');
    console.error('   Example: pnpm run generate:repo:prisma company-data-set');
    process.exit(1);
  }

  const generator = new RepositoryGenerator({
    entityName,
  });

  generator.generate();
}
