import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailPayload } from './types/email.types';

@Injectable()
export class ResendProvider {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL!;
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }

  async send(payload: EmailPayload): Promise<string> {
    const { data, error } = await this.resend.emails.send({
      from: payload.from || this.fromEmail,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response from Resend API');
    }

    return data.id;
  }
}
