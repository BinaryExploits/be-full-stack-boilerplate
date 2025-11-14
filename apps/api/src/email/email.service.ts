import { Injectable } from '@nestjs/common';
import {
  Logger,
  COMPANY_NAME,
  PRODUCT_NAME,
  SUPPORT_EMAIL,
} from '@repo/utils-core';
import { Resend } from 'resend';
import {
  VerificationEmailArgs,
  EmailTemplateName,
  TypedEmailArgs,
  LoadedTemplate,
} from './types/email.types';
import { loadTemplate } from './template-loader';

@Injectable()
export class EmailService {
  private readonly resend: Resend = new Resend(process.env.RESEND_API_KEY);
  private readonly fromEmail: string = process.env.RESEND_FROM_EMAIL!;

  async sendVerificationEmail(emailArgs: VerificationEmailArgs): Promise<void> {
    if (emailArgs.type === 'sign-in') {
      await this.sendEmail({
        templateName: 'sign-in-otp',
        to: emailArgs.to,
        data: {
          otp: emailArgs.otp,
          companyName: COMPANY_NAME,
          productName: PRODUCT_NAME,
          supportEmail: SUPPORT_EMAIL,
        },
      });
    } else {
      Logger.instance.critical('Unsupported email type', emailArgs.type);
    }
  }

  async sendEmail<T extends EmailTemplateName>(
    emailArgs: TypedEmailArgs<T>,
  ): Promise<void> {
    const { to, templateName, data } = emailArgs;
    const template: LoadedTemplate = loadTemplate(templateName, data);

    const { data: sendEmailResponse, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!sendEmailResponse) {
      Logger.instance.critical(`No response from ${Resend.name} send call`);
      return;
    }

    if (error) {
      Logger.instance.critical(
        `Failed to send email (${templateName}) to ${to}:`,
        error,
      );
      return;
    }

    Logger.instance.info(
      `Email (${templateName}) sent successfully to ${to}. Email UUID: ${sendEmailResponse.id}`,
    );
  }
}
