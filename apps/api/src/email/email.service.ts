import { Injectable } from '@nestjs/common';
import { Logger } from '@repo/utils-core';
import { Resend } from 'resend';
import { BaseEmail, OTPEmail } from './types/email.types';
import { loadSignInOtpTemplate } from './template-loader';

@Injectable()
export class EmailService {
  private readonly resend: Resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(emailArgs: OTPEmail<BaseEmail>) {
    let htmlContent: string = '';
    switch (emailArgs.type) {
      case 'sign-in': {
        htmlContent = loadSignInOtpTemplate(emailArgs.otp);
        break;
      }
      case 'email-verification':
      case 'forget-password':
        break;
    }

    const { data: sendEmailResponse, error } = await this.resend.emails.send({
      from: emailArgs.from,
      to: emailArgs.to,
      subject: emailArgs.subject,
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
