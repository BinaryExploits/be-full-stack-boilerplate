import { Injectable } from '@nestjs/common';
import {
  Logger,
  COMPANY_NAME,
  PRODUCT_NAME,
  SUPPORT_EMAIL,
} from '@repo/utils-core';
import { Resend } from 'resend';
import {
  EmailTemplateName,
  SendEmailArgs,
  RenderedEmail,
} from './types/email.types';
import { renderEmail } from './email.renderer';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL!;
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }

  async sendVerificationEmail(
    to: string,
    otp: string,
    type: 'sign-in',
  ): Promise<void> {
    if (type === 'sign-in') {
      await this.sendEmail({
        to: to,
        templateName: 'sign-in-otp',
        templateData: {
          otp: otp,
          companyName: COMPANY_NAME,
          productName: PRODUCT_NAME,
          supportEmail: SUPPORT_EMAIL,
        },
      });
    } else {
      Logger.instance.critical('Unsupported email type', type);
    }
  }

  private async sendEmail<T extends EmailTemplateName>(
    sendEmailArgs: SendEmailArgs<T>,
  ): Promise<void> {
    const { to, templateName, templateData } = sendEmailArgs;
    const renderedEmail: RenderedEmail = await renderEmail(
      templateName,
      templateData,
    );

    const { data: sendEmailResponse, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: to,
      subject: renderedEmail.subject,
      html: renderedEmail.html,
      text: renderedEmail.text,
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
