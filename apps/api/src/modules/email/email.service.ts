/* eslint-disable custom/require-transactional */
import { Injectable } from '@nestjs/common';
import {
  COMPANY_NAME,
  Logger,
  PRODUCT_NAME,
  SUPPORT_EMAIL,
} from '@repo/utils-core';
import {
  EmailProvider,
  EmailTemplateName,
  RenderedEmail,
  SendEmailArgs,
} from './types/email.types';
import { renderEmail } from './email.renderer';
import { ResendProvider } from './resend.provider';
import { AwsSesProvider } from './aws-ses.provider';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly resendProvider: ResendProvider,
    private readonly awsSesProvider: AwsSesProvider,
  ) {}

  async sendVerificationEmail(
    to: string,
    otp: string,
    type: 'sign-in',
    provider: EmailProvider,
  ): Promise<void> {
    if (type === 'sign-in') {
      await this.sendEmail({
        to,
        templateName: 'sign-in-otp',
        templateData: {
          otp,
          companyName: COMPANY_NAME,
          productName: PRODUCT_NAME,
          supportEmail: SUPPORT_EMAIL,
        },
        provider,
      });
    } else {
      Logger.instance.critical('Unsupported email type', type);
    }
  }

  async sendEmailVerificationEmail(
    to: string,
    verificationUrl: string,
    provider: EmailProvider,
  ): Promise<void> {
    await this.sendEmail({
      to,
      templateName: 'email-verification',
      templateData: {
        verificationUrl,
        companyName: COMPANY_NAME,
        productName: PRODUCT_NAME,
        supportEmail: SUPPORT_EMAIL,
      },
      provider,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetUrl: string,
    provider: EmailProvider,
  ): Promise<void> {
    await this.sendEmail({
      to,
      templateName: 'password-reset',
      templateData: {
        resetUrl,
        companyName: COMPANY_NAME,
        productName: PRODUCT_NAME,
        supportEmail: SUPPORT_EMAIL,
      },
      provider,
    });
  }

  private async sendEmail<T extends EmailTemplateName>(
    sendEmailArgs: SendEmailArgs<T>,
  ): Promise<void> {
    const { to, templateName, templateData, provider } = sendEmailArgs;

    if (!provider) {
      throw new Error('Email provider must be explicitly specified.');
    }

    const renderedEmail: RenderedEmail = await renderEmail(
      templateName,
      templateData,
    );

    try {
      let messageId: string;

      switch (provider) {
        case EmailProvider.RESEND:
          messageId = await this.resendProvider.send({
            to,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          });
          break;
        case EmailProvider.AWS_SES:
          messageId = await this.awsSesProvider.send({
            to,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          });
          break;
        default:
          throw new Error(`Unsupported email provider: ${String(provider)}`);
      }

      Logger.instance.info(`Email (${templateName}) sent successfully`);
    } catch (error) {
      Logger.instance.critical(
        `Failed to send email (${templateName})`,
        error,
      );
    }
  }
}
