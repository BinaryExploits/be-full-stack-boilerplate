import { z } from 'zod';
import { ZBaseRequest, ZBaseResponse } from '../../schemas/base.schema';

// ─── My Data (Right of Access / Portability) ────────────────────

export const ZGdprMyDataResponse = ZBaseResponse.extend({
  user: z.object({
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    consentGiven: z.boolean(),
    consentAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  accounts: z.array(
    z.object({
      providerId: z.string(),
      scope: z.string().nullable(),
      createdAt: z.date(),
    }),
  ),
  sessions: z.array(
    z.object({
      ipAddress: z.string().nullable(),
      userAgent: z.string().nullable(),
      createdAt: z.date(),
      expiresAt: z.date(),
    }),
  ),
  profile: z
    .object({
      createdAt: z.date(),
    })
    .nullable(),
  tenantMemberships: z.array(
    z.object({
      role: z.string(),
      createdAt: z.date(),
    }),
  ),
});

// ─── Update Profile (Right of Rectification) ───────────────────

export const ZGdprUpdateProfileRequest = ZBaseRequest.extend({
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  image: z.string().max(2048).nullable().optional(),
});

export const ZGdprUpdateProfileResponse = ZBaseResponse.extend({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    updatedAt: z.date(),
  }),
});

// ─── Delete Account (Right to Erasure) ──────────────────────────

export const ZGdprDeleteAccountRequest = ZBaseRequest.extend({
  confirmation: z.string(),
});

export const ZGdprDeleteAccountResponse = ZBaseResponse;

// ─── Types ──────────────────────────────────────────────────────

export type TGdprMyDataResponse = z.infer<typeof ZGdprMyDataResponse>;
export type TGdprUpdateProfileRequest = z.infer<
  typeof ZGdprUpdateProfileRequest
>;
export type TGdprUpdateProfileResponse = z.infer<
  typeof ZGdprUpdateProfileResponse
>;
export type TGdprDeleteAccountRequest = z.infer<
  typeof ZGdprDeleteAccountRequest
>;
export type TGdprDeleteAccountResponse = z.infer<
  typeof ZGdprDeleteAccountResponse
>;
