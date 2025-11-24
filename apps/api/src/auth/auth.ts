import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { expo } from '@better-auth/expo';
import { EmailService } from '../email/email.service';
import { BetterAuthLogger } from '../utils/logger/logger-better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

export const createBetterAuth = (
  emailService: EmailService,
  betterAuthLogger: BetterAuthLogger,
) => {
  const client = new MongoClient(process.env.DATABASE_URL!);
  const db = client.db();

  // noinspection JSUnusedGlobalSymbols
  return betterAuth({
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || [],
    basePath: '/api/auth',
    database: mongodbAdapter(db, {
      client,
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
          if (type === 'sign-in') {
            await emailService.sendVerificationEmail(email, otp, type);
          }
        },
      }),
    ],
    logger: betterAuthLogger,
  });
};
