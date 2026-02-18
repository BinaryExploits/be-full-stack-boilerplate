import { z } from 'zod';
import {
  ZBaseEntity,
  ZBaseRequest,
  ZBaseResponse,
} from '../../schemas/base.schema';

// ─── Tenant CRUD ────────────────────────────────────────────────

export const ZTenant = ZBaseEntity.extend({
  name: z.string(),
  slug: z.string(),
  allowedOrigins: z.array(z.string()),
});

export const ZTenantCreateRequest = ZBaseRequest.extend({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  allowedOrigins: z.array(z.string().min(1)).min(0),
});

export const ZTenantCreateResponse = ZTenant;

export const ZTenantFindAllResponse = ZBaseResponse.extend({
  tenants: z.array(ZTenant),
});

export const ZTenantFindOneRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZTenantFindOneResponse = ZTenant.nullable();

export const ZTenantUpdateRequest = ZBaseRequest.extend({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  allowedOrigins: z.array(z.string().min(1)).optional(),
});

export const ZTenantUpdateResponse = ZTenant;

export const ZTenantDeleteRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZTenantDeleteResponse = ZBaseResponse;

export const ZTenantMetaIsSuperAdminResponse = ZBaseResponse.extend({
  isSuperAdmin: z.boolean(),
});

// ─── Tenant Membership ──────────────────────────────────────────

export const ZTenantRole = z.enum(['TENANT_ADMIN', 'TENANT_USER']);

export const ZMyTenantsResponse = ZBaseResponse.extend({
  tenants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      role: ZTenantRole,
    }),
  ),
  selectedTenantId: z.string().nullable(),
});

export const ZSwitchTenantRequest = ZBaseRequest.extend({
  tenantId: z.string(),
});

export const ZSwitchTenantResponse = ZBaseResponse.extend({
  selectedTenantId: z.string(),
});

export const ZAddMemberRequest = ZBaseRequest.extend({
  email: z.string().email(),
  tenantId: z.string(),
  role: ZTenantRole,
});

export const ZAddMemberResponse = ZBaseResponse.extend({
  id: z.string(),
  email: z.string(),
  tenantId: z.string(),
  role: ZTenantRole,
});

export const ZRemoveMemberRequest = ZBaseRequest.extend({
  email: z.string().email(),
  tenantId: z.string(),
});

export const ZRemoveMemberResponse = ZBaseResponse;

export const ZListMembersRequest = ZBaseRequest.extend({
  tenantId: z.string(),
});

export const ZListMembersResponse = ZBaseResponse.extend({
  members: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      tenantId: z.string(),
      role: ZTenantRole,
    }),
  ),
});

// ─── Types ──────────────────────────────────────────────────────

export type Tenant = z.infer<typeof ZTenant>;
export type TTenantCreateRequest = z.infer<typeof ZTenantCreateRequest>;
export type TTenantCreateResponse = z.infer<typeof ZTenantCreateResponse>;
export type TTenantFindAllResponse = z.infer<typeof ZTenantFindAllResponse>;
export type TTenantFindOneRequest = z.infer<typeof ZTenantFindOneRequest>;
export type TTenantFindOneResponse = z.infer<typeof ZTenantFindOneResponse>;
export type TTenantUpdateRequest = z.infer<typeof ZTenantUpdateRequest>;
export type TTenantUpdateResponse = z.infer<typeof ZTenantUpdateResponse>;
export type TTenantDeleteRequest = z.infer<typeof ZTenantDeleteRequest>;
export type TTenantDeleteResponse = z.infer<typeof ZTenantDeleteResponse>;
export type TTenantMetaIsSuperAdminResponse = z.infer<
  typeof ZTenantMetaIsSuperAdminResponse
>;
export type TMyTenantsResponse = z.infer<typeof ZMyTenantsResponse>;
export type TSwitchTenantRequest = z.infer<typeof ZSwitchTenantRequest>;
export type TSwitchTenantResponse = z.infer<typeof ZSwitchTenantResponse>;
export type TAddMemberRequest = z.infer<typeof ZAddMemberRequest>;
export type TAddMemberResponse = z.infer<typeof ZAddMemberResponse>;
export type TRemoveMemberRequest = z.infer<typeof ZRemoveMemberRequest>;
export type TRemoveMemberResponse = z.infer<typeof ZRemoveMemberResponse>;
export type TListMembersRequest = z.infer<typeof ZListMembersRequest>;
export type TListMembersResponse = z.infer<typeof ZListMembersResponse>;
