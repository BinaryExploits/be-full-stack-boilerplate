import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EmailTemplateName,
  EmailTemplateData,
  RenderedEmail,
  EMAIL_TEMPLATE_META,
} from './types/email.types';

const TEMPLATES_DIR: string = join(__dirname, 'templates');

function readTemplateFile(fileName: string): string {
  const filePath: string = join(TEMPLATES_DIR, fileName);
  return readFileSync(filePath, 'utf8');
}

// TODO: Optimize
function fillTemplate<T extends EmailTemplateName>(
  template: string,
  templateData: EmailTemplateData<T>,
): string {
  let filledTemplate: string = template;

  for (const [key, value] of Object.entries(templateData)) {
    const placeholder = `{{${key}}}`;
    filledTemplate = filledTemplate.split(placeholder).join(String(value));
  }

  return filledTemplate;
}

export function renderEmail<T extends EmailTemplateName>(
  templateName: T,
  templateData: EmailTemplateData<T>,
): RenderedEmail {
  const meta = EMAIL_TEMPLATE_META[templateName];

  const htmlTemplate: string = readTemplateFile(meta.htmlFile);
  const textTemplate: string = readTemplateFile(meta.textFile);

  const html: string = fillTemplate(htmlTemplate, templateData);
  const text: string = fillTemplate(textTemplate, templateData);

  return {
    html,
    text,
    subject: meta.subject,
  };
}
