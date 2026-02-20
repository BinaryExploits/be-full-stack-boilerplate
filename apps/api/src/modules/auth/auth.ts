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
import { Logger } from '@repo/utils-core';

const prisma = new PrismaClient();

const createDatabaseAdapter = () => {
  return prismaAdapter(prisma, {
    provider: 'postgresql',
  });
};

export const createBetterAuth = (
  emailService: EmailService,
  betterAuthLogger: BetterAuthLogger,
) => {
  // noinspection JSUnusedGlobalSymbols
  const isDevelopment =
    parseNodeEnvironment(process.env.NODE_ENV) === NodeEnvironment.Development;

  return betterAuth({
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || [],
    basePath: '/api/auth',
    database: createDatabaseAdapter(),
    databaseHooks: {
      user: {
        create: {
          after: async (user, ctx) => {
            const ipAddress =
              ctx?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
              ctx?.headers?.get?.('x-real-ip') ??
              null;

            try {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  consentGiven: true,
                  consentAt: new Date(),
                  consentIp: ipAddress,
                },
              });
              await prisma.gdprAuditLog.create({
                data: {
                  userId: user.id,
                  action: 'CONSENT_GIVEN',
                  details: 'Consent recorded at account creation',
                  ipAddress,
                },
              });
            } catch (err) {
              Logger.instance
                .withContext('Auth')
                .critical('Failed to record GDPR consent', err);
            }
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: !isDevelopment,
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
      sendOnSignUp: !isDevelopment,
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
