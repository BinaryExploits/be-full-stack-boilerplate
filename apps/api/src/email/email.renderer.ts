import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  EmailTemplateName,
  EmailTemplateData,
  RenderedEmail,
  EMAIL_TEMPLATE_META,
} from './types/email.types';

const TEMPLATES_DIR: string = join(__dirname, 'templates');

async function readTemplateFile(fileName: string): Promise<string> {
  const filePath: string = join(TEMPLATES_DIR, fileName);
  return await readFile(filePath, 'utf8');
}

function fillTemplate<T extends EmailTemplateName>(
  template: string,
  templateData: EmailTemplateData<T>,
): string {
  let filledTemplate: string = template;

  for (const [key, value] of Object.entries(templateData)) {
    const placeholder = `{{${key}}}`;
    filledTemplate = filledTemplate.replaceAll(placeholder, String(value));
  }

  return filledTemplate;
}

export async function renderEmail<T extends EmailTemplateName>(
  templateName: T,
  templateData: EmailTemplateData<T>,
): Promise<RenderedEmail> {
  const meta = EMAIL_TEMPLATE_META[templateName];

  const htmlTemplate: string = await readTemplateFile(meta.htmlFile);
  const textTemplate: string = await readTemplateFile(meta.textFile);

  const html: string = fillTemplate(htmlTemplate, templateData);
  const text: string = fillTemplate(textTemplate, templateData);

  return {
    html,
    text,
    subject: meta.subject,
  };
}
