import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { expo } from '@better-auth/expo';
import { EmailService } from './email/email.service';

const prisma = new PrismaClient();

export const createBetterAuth = () => {
  return betterAuth({
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || [],
    basePath: '/api/auth',
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
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
          const emailService = new EmailService(); // TODO: Inject it
          if (type === 'sign-in') {
            const subject = 'Your Sign-In Code';
            await emailService.sendVerificationEmail({
              from: 'onboarding@resend.dev',
              to: email,
              subject: subject,
              otp: otp,
              type: type,
            });
          }
        },
      }),
    ],
  });
};
