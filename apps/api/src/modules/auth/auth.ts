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
import { encryptField, decryptField } from '../../lib/field-encryption';

const TOKEN_FIELDS = ['accessToken', 'refreshToken', 'idToken'] as const;

function encryptTokenFields(data: Record<string, unknown>): void {
  for (const field of TOKEN_FIELDS) {
    if (typeof data[field] === 'string') {
      data[field] = encryptField(data[field]);
    }
  }
}

function decryptTokenFields(record: Record<string, unknown>): void {
  for (const field of TOKEN_FIELDS) {
    if (typeof record[field] === 'string') {
      record[field] = decryptField(record[field]);
    }
  }
}

function decryptResult(result: unknown): void {
  if (Array.isArray(result)) {
    for (const r of result) decryptTokenFields(r as Record<string, unknown>);
  } else if (result && typeof result === 'object') {
    decryptTokenFields(result as Record<string, unknown>);
  }
}

const basePrisma = new PrismaClient();

/**
 * Wraps a Prisma model delegate so that token fields on the Account
 * model are encrypted before writes and decrypted after reads.
 * Uses a JS Proxy so it works regardless of how the caller accesses
 * methods (typed or dynamic string indexing).
 */
function wrapAccountDelegate(delegate: Record<string, unknown>): unknown {
  const WRITE_METHODS = new Set(['create', 'update', 'upsert']);
  const READ_METHODS = new Set([
    'findUnique',
    'findFirst',
    'findMany',
    'create',
    'update',
    'upsert',
  ]);

  return new Proxy(delegate, {
    get(target, prop) {
      const original = target[prop as string];
      if (typeof original !== 'function') return original;

      const method = String(prop);

      if (WRITE_METHODS.has(method) || READ_METHODS.has(method)) {
        return async (...args: unknown[]) => {
          const params = args[0] as Record<string, unknown> | undefined;

          if (WRITE_METHODS.has(method) && params) {
            if (method === 'upsert') {
              if (params.create)
                encryptTokenFields(params.create as Record<string, unknown>);
              if (params.update)
                encryptTokenFields(params.update as Record<string, unknown>);
            } else if (params.data) {
              encryptTokenFields(params.data as Record<string, unknown>);
            }
          }

          const result = await original.apply(target, args);

          if (READ_METHODS.has(method)) {
            decryptResult(result);
          }

          return result;
        };
      }

      return original.bind(target);
    },
  });
}

const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    const value = (target as unknown as Record<string | symbol, unknown>)[prop];
    if (prop === 'account') {
      return wrapAccountDelegate(value as Record<string, unknown>);
    }
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
}) as unknown as PrismaClient;

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
              await basePrisma.user.update({
                where: { id: user.id },
                data: {
                  consentGiven: true,
                  consentAt: new Date(),
                  consentIp: ipAddress,
                },
              });
              await basePrisma.gdprAuditLog.create({
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
