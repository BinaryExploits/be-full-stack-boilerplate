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
      const payload = {
        to,
        subject: renderedEmail.subject,
        html: renderedEmail.html,
        text: renderedEmail.text,
      };

      switch (provider) {
        case EmailProvider.RESEND:
          await this.resendProvider.send(payload);
          break;
        case EmailProvider.AWS_SES:
          await this.awsSesProvider.send(payload);
          break;
        default:
          throw new Error(`Unsupported email provider: ${String(provider)}`);
      }

      Logger.instance.info(`Email (${templateName}) sent successfully`);
    } catch (error) {
      Logger.instance.critical(`Failed to send email (${templateName})`, error);
    }
  }
}
