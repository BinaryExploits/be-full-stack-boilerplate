import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { EmailService } from '../email/email.service';
import { EmailProvider } from '../email/types/email.types';
import { BetterAuthLogger } from '../logger/logger-better-auth';
import {
  NodeEnvironment,
  parseNodeEnvironment,
} from '../../lib/types/environment.type';

const createDatabaseAdapter = () => {
  const prisma = new PrismaClient();
  return prismaAdapter(prisma, {
    provider: 'postgresql',
  });
};

export const createBetterAuth = (
  emailService: EmailService,
  betterAuthLogger: BetterAuthLogger,
) => {
  // noinspection JSUnusedGlobalSymbols
  return betterAuth({
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || [],
    basePath: '/api/auth',
    database: createDatabaseAdapter(),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await emailService.sendPasswordResetEmail(
          user.email,
          url,
          EmailProvider.AWS_SES,
        );
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        accessType: 'offline',
        prompt:
          parseNodeEnvironment(process.env.NODE_ENV) ===
          NodeEnvironment.Production
            ? undefined
            : 'consent',
        scope: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await emailService.sendEmailVerificationEmail(
          user.email,
          url,
          EmailProvider.AWS_SES,
        );
      },
    },
    plugins: [
      expo(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (type === 'sign-in') {
            await emailService.sendVerificationEmail(
              email,
              otp,
              type,
              EmailProvider.AWS_SES,
            );
          }
        },
      }),
    ],
    logger: betterAuthLogger,
  });
};
