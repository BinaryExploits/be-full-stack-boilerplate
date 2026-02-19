import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EmailPayload } from './types/email.types';

@Injectable()
export class AwsSesProvider {
  private readonly client: SESClient | null;
  private readonly fromEmail: string | undefined;

  constructor() {
    const region = process.env.AWS_SES_REGION;
    this.fromEmail = process.env.AWS_SES_FROM_EMAIL;

    if (region) {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

      // Use explicit credentials if provided, otherwise rely on the default
      // credential provider chain (IAM role, instance profile, ECS task role, etc.)
      this.client = new SESClient({
        region,
        ...(accessKeyId && secretAccessKey
          ? { credentials: { accessKeyId, secretAccessKey } }
          : {}),
      });
    } else {
      this.client = null;
    }
  }

  async send(payload: EmailPayload): Promise<string> {
    if (!this.client || !this.fromEmail) {
      throw new InternalServerErrorException(
        'AWS SES is not configured. Set AWS_SES_REGION and AWS_SES_FROM_EMAIL at minimum.',
      );
    }

    const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];

    const command = new SendEmailCommand({
      Source: payload.from || this.fromEmail,
      Destination: { ToAddresses: toAddresses },
      Message: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: payload.html, Charset: 'UTF-8' },
          ...(payload.text
            ? { Text: { Data: payload.text, Charset: 'UTF-8' } }
            : {}),
        },
      },
    });

    try {
      const result = await this.client.send(command);
      return result.MessageId || 'unknown';
    } catch (error) {
      throw new InternalServerErrorException(
        `AWS SES send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
