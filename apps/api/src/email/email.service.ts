import { Injectable } from '@nestjs/common';
import { Logger } from '@repo/utils-core';
import { Resend } from 'resend';
import { VerificationEmailArgs } from './types/email.types';
import { loadSignInOtpTemplate } from './template-loader';

@Injectable()
export class EmailService {
  private readonly resend: Resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(emailArgs: VerificationEmailArgs) {
    let subject: string = '';
    let htmlContent: string = '';

    if (emailArgs.type === 'sign-in') {
      subject = 'Sign in OTP';
      htmlContent = loadSignInOtpTemplate(emailArgs.otp);
    } else {
      Logger.instance.critical('Unsupported email type', emailArgs.type);
      return;
    }

    const { data: sendEmailResponse, error } = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emailArgs.to,
      subject: subject,
      html: htmlContent,
    });

    if (!sendEmailResponse) {
      Logger.instance.critical('No response from sendEmail');
      return;
    }

    if (error) {
      Logger.instance.critical(
        `Failed to send OTP email to ${emailArgs.to}:`,
        error,
      );
      return;
    }

    Logger.instance.info(
      `${emailArgs.type} OTP sent successfully to ${emailArgs.to}. Email ID: ${sendEmailResponse.id}`,
    );
  }
}
