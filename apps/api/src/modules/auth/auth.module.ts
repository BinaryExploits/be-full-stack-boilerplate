import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import { AuthService } from './auth.service';
import { AuthMiddleware } from './auth.middleware';
import { createBetterAuth } from './auth';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [EmailModule],
      inject: [EmailService, BetterAuthLogger],
      useFactory: (
        emailService: EmailService,
        betterAuthLogger: BetterAuthLogger,
      ) => ({
        auth: createBetterAuth(emailService, betterAuthLogger),
      }),
    }),
    EmailModule,
  ],
  providers: [AuthService, AuthMiddleware],
  exports: [AuthService, AuthMiddleware],
})
export class AuthModule {}
