import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { expo } from '@better-auth/expo';
import { Logger } from '@repo/utils-core';

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
          if (type === 'sign-in') {
            Logger.instance.info(`${type} OTP: ${otp} for ${email}`);
            // // Logic to check if user exists for a potential sign-up
            // const userExists = await checkIfUserExistsByEmail(email); // query your db to check  for this user
            //
            // if (!userExists) {
            //   console.log(`Sending sign-up OTP ${otp} to ${email}`);
            //   // Logic to send the OTP for new user registration
            //   await sendEmail(email, otp); // your send function
            // } else {
            //   console.log(
            //     `User ${email} found, not sending sign-in OTP (or handle existing user sign-in flow)`,
            //   );
            // }
          }
        },
      }),
    ],
  });
};
