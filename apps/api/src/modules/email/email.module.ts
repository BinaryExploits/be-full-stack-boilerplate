import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendProvider } from './resend.provider';
import { AwsSesProvider } from './aws-ses.provider';

@Module({
  providers: [ResendProvider, AwsSesProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
