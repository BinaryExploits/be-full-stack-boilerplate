import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EmailTemplateName,
  TemplateData,
  LoadedTemplate,
  TEMPLATE_METADATA,
} from './types/email.types';

const TEMPLATES_DIR: string = join(__dirname, 'templates');

function readTemplateFile(fileName: string): string {
  const filePath: string = join(TEMPLATES_DIR, fileName);
  return readFileSync(filePath, 'utf8');
}

/**
 * Fills template with the provided data
 * Replaces {{KEY}} placeholders with values from data
 */
function fillTemplate<T extends EmailTemplateName>(
  template: string,
  data: TemplateData<T>,
): string {
  let result: string = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholderKey: string = camelToSnakeCase(key);
    const placeholderLiteral = `{{${placeholderKey}}}`;
    result = result.split(placeholderLiteral).join(String(value));
  }

  return result;
}

/**
 * Converts camelCase to SNAKE_CASE
 * Examples: otp -> OTP, companyName -> COMPANY_NAME, supportEmail -> SUPPORT_EMAIL
 */
function camelToSnakeCase(str: string): string {
  return str
    .replaceAll(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, ''); // Remove leading underscore if any
}

/**
 * Type-safe template loader
 * Loads both HTML and text versions of a template and fills them with data
 *
 * @param templateName - The name of the template to load
 * @param data - The data required for this template (type-checked at compile time)
 * @returns LoadedTemplate with HTML and text versions
 *
 * @example
 * const template = loadTemplate('sign-in-otp', {
 *   otp: '123456',
 *   companyName: 'Acme Inc',
 *   productName: 'Acme App',
 *   supportEmail: 'support@acme.com'
 * });
 * // TypeScript ensures all required fields are provided!
 */
export function loadTemplate<T extends EmailTemplateName>(
  templateName: T,
  data: TemplateData<T>,
): LoadedTemplate {
  const metadata = TEMPLATE_METADATA[templateName];

  const htmlTemplate: string = readTemplateFile(metadata.htmlFile);
  const textTemplate: string = readTemplateFile(metadata.textFile);

  const html: string = fillTemplate(htmlTemplate, data);
  const text: string = fillTemplate(textTemplate, data);

  return {
    html,
    text,
    subject: metadata.subject,
  };
}
