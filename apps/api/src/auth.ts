import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/prisma-db';
import { expo } from '@better-auth/expo';

const prisma = new PrismaClient();

export const createBetterAuth = () => {
  return betterAuth({
    plugins: [expo()],
    trustedOrigins: process.env.CORS_ORIGINS?.split(',') || [],
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
  });
};
