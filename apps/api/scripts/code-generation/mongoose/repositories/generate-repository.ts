import * as fs from 'fs';
import * as path from 'path';

interface GeneratorConfig {
  entityName: string;
}

export class RepositoryGenerator {
  private readonly entityName: string;
  private readonly entityNameCapitalized: string;
  private readonly outputDir: string;
  private readonly templatesDir: string;

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
    this.templatesDir = path.join(__dirname, 'templates');
  }

  generate(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.generateEntity();
    this.generateInterface();
    this.generateRepository();

    console.log(
      `✅ Generated repository for ${this.entityNameCapitalized} in ${this.outputDir}`,
    );
  }

  private generateEntity(): void {
    const content = this.loadTemplate('entity.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongoose-entity.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateInterface(): void {
    const content = this.loadTemplate('interface.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongoose-repository.interface.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private generateRepository(): void {
    const content = this.loadTemplate('repository.template.txt');
    const filePath = path.join(
      this.outputDir,
      `${this.entityName}.mongoose-repository.ts`,
    );
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders
    template = template.replace(
      /{{ENTITY_NAME_CAPITALIZED}}/g,
      this.entityNameCapitalized,
    );
    template = template.replace(/{{ENTITY_NAME_LOWER}}/g, this.entityName);

    return template;
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
