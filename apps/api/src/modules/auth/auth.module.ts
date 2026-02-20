import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import { AuthService } from './auth.service';
import { AuthMiddleware } from './auth.middleware';
import { createBetterAuth } from './auth';
import { UserPrismaRepository } from './repositories/prisma/user.prisma-repository';
import { AccountPrismaRepository } from './repositories/prisma/account.prisma-repository';
import { SessionPrismaRepository } from './repositories/prisma/session.prisma-repository';

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
        // Fix for Express 5: The /*path pattern sets req.url=/ and req.baseUrl=full_path
        // better-call concatenates baseUrl+url creating a trailing slash that causes 404
        // This middleware restores req.url to the full path before the handler runs
        middleware: (req, _res, next) => {
          req.url = req.originalUrl;
          req.baseUrl = '';
          next();
        },
      }),
    }),
    EmailModule,
  ],
  providers: [
    AuthService,
    AuthMiddleware,
    UserPrismaRepository,
    AccountPrismaRepository,
    SessionPrismaRepository,
  ],
  exports: [
    AuthService,
    AuthMiddleware,
    UserPrismaRepository,
    AccountPrismaRepository,
    SessionPrismaRepository,
  ],
})
export class AuthModule {}
