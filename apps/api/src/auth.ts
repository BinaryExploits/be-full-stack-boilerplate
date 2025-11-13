import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { expo } from '@better-auth/expo';
import { Logger } from '@repo/utils-core';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend('re_WwFqzj8x_7EXz8PETCx7vvmYYewQuUQCJ');

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
          let subject = '';
          let htmlContent = '';

          if (type === 'sign-in') {
            subject = 'Your Sign-In Code';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Sign In to Your Account</h2>
                  <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                  <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                  </div>
                  <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
                  <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
              `;
          }

          const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject,
            html: htmlContent,
          });

          if (error) {
            Logger.instance.critical(
              `Failed to send OTP email to ${email}:`,
              error,
            );
            throw new Error('Failed to send verification email');
          }

          Logger.instance.info(
            `${type} OTP sent successfully to ${email}. Email ID: ${data?.id}`,
          );
        },
      }),
    ],
  });
};
