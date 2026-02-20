import { z } from 'zod';
import { ZBaseRequest, ZBaseResponse } from '../../schemas/base.schema';

// ─── My Data (Right of Access / Portability) ────────────────────

export const ZGdprMyDataResponse = ZBaseResponse.extend({
  user: z.object({
    id: z.string(),
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
      id: z.string(),
      providerId: z.string(),
      accountId: z.string(),
      scope: z.string().nullable(),
      createdAt: z.date(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string(),
      ipAddress: z.string().nullable(),
      userAgent: z.string().nullable(),
      createdAt: z.date(),
      expiresAt: z.date(),
    }),
  ),
  profile: z
    .object({
      selectedTenantId: z.string().nullable(),
      createdAt: z.date(),
    })
    .nullable(),
  tenantMemberships: z.array(
    z.object({
      id: z.string(),
      tenantId: z.string(),
      role: z.string(),
      createdAt: z.date(),
    }),
  ),
});

// ─── Update Profile (Right of Rectification) ───────────────────

export const ZGdprUpdateProfileRequest = ZBaseRequest.extend({
  name: z.string().min(1).max(255).optional(),
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
