import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { expo } from '@better-auth/expo';

const prisma = new PrismaClient();

export const createBetterAuth = () => {
  return betterAuth({
    trustedOrigins: [
      'mobile://', // Mobile deep link scheme
      'exp://192.168.0.6:8081', // Legacy Expo (if needed)
      'http://localhost:3000', // Web
      'http://localhost:8081', // Expo Web
      'http://10.0.2.2:8081', // Android emulator web
    ],
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
    plugins: [expo()],
  });
};
