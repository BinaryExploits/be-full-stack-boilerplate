import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../logger/logger-better-auth';

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
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    plugins: [
      expo(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (type === 'sign-in') {
            await emailService.sendVerificationEmail(email, otp, type);
          }
        },
      }),
    ],
    logger: betterAuthLogger,
  });
};
