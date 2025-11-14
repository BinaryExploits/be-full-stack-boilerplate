import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPANY_NAME, PRODUCT_NAME, SUPPORT_EMAIL } from '@repo/utils-core';

const TEMPLATES_DIR: string = join(__dirname, 'templates');

function readTemplateFile(fileName: string): string {
  const filePath: string = join(TEMPLATES_DIR, fileName);
  return readFileSync(filePath, 'utf8');
}

function fillTemplate(template: string, map: Record<string, string>): string {
  let result: string = template;

  for (const key of Object.keys(map)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(map[key]);
  }

  return result;
}

export function loadSignInOtpTemplate(otp: string): string {
  const template: string = readTemplateFile('sign-in-otp.html');

  const params = {
    OTP: otp,
    COMPANY_NAME: COMPANY_NAME!,
    PRODUCT_NAME: PRODUCT_NAME,
    SUPPORT_EMAIL: SUPPORT_EMAIL,
  };

  return fillTemplate(template, params);
}
