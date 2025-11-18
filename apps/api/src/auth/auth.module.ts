import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../utils/logger/logger-better-auth';
import { AuthService, BETTER_AUTH_TOKEN } from './auth.service';
import { createBetterAuth } from './auth';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [PrismaModule, EmailModule],
      inject: [PrismaService, EmailService, BetterAuthLogger],
      useFactory: (
        prismaService: PrismaService,
        emailService: EmailService,
        betterAuthLogger: BetterAuthLogger,
      ) => ({
        auth: createBetterAuth(prismaService, emailService, betterAuthLogger),
      }),
    }),
    PrismaModule,
    EmailModule,
  ],
  providers: [
    {
      provide: BETTER_AUTH_TOKEN,
      inject: [PrismaService, EmailService, BetterAuthLogger],
      useFactory: (
        prismaService: PrismaService,
        emailService: EmailService,
        betterAuthLogger: BetterAuthLogger,
      ) => createBetterAuth(prismaService, emailService, betterAuthLogger),
    },
    AuthService,
    AuthMiddleware,
  ],
  exports: [AuthService, AuthMiddleware],
})
export class AuthModule {}
