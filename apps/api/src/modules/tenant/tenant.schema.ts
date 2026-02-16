import { z } from 'zod';

export const ZTenant = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  allowedOrigins: z.array(z.string()),
  isDefault: z.boolean(),
});

export const ZTenantCreateRequest = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  allowedOrigins: z.array(z.string().min(1)).min(0),
  isDefault: z.boolean().optional(),
});

export const ZTenantCreateResponse = ZTenant;

export const ZTenantFindAllResponse = z.object({
  tenants: z.array(ZTenant),
});

export const ZTenantFindOneRequest = z.object({
  id: z.string().uuid(),
});

export const ZTenantFindOneResponse = ZTenant.nullable();

export const ZTenantUpdateRequest = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  allowedOrigins: z.array(z.string().min(1)).optional(),
  isDefault: z.boolean().optional(),
});

export const ZTenantUpdateResponse = ZTenant;

export const ZTenantDeleteRequest = z.object({
  id: z.string().uuid(),
});

export const ZTenantDeleteResponse = z.object({ success: z.boolean() });

export type TTenant = z.infer<typeof ZTenant>;
export type TTenantCreateRequest = z.infer<typeof ZTenantCreateRequest>;
export type TTenantCreateResponse = z.infer<typeof ZTenantCreateResponse>;
export type TTenantFindAllResponse = z.infer<typeof ZTenantFindAllResponse>;
export type TTenantFindOneRequest = z.infer<typeof ZTenantFindOneRequest>;
export type TTenantFindOneResponse = z.infer<typeof ZTenantFindOneResponse>;
export type TTenantUpdateRequest = z.infer<typeof ZTenantUpdateRequest>;
export type TTenantUpdateResponse = z.infer<typeof ZTenantUpdateResponse>;
export type TTenantDeleteRequest = z.infer<typeof ZTenantDeleteRequest>;
export type TTenantDeleteResponse = z.infer<typeof ZTenantDeleteResponse>;
