import { z } from 'zod';

// Base schemas (Ideally in a separate file)
const ZBaseRequest = z.object({
  requestId: z.string().uuid().optional(),
  timestamp: z.number().optional(),
});

const ZBaseResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Crud schemas
export const ZCrudModel = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1).max(1000),
});

// API schemas
export const ZCrudCreateRequest = ZBaseRequest.extend({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(500, 'Content too long'),
});

export const ZCrudCreateResponse = ZBaseResponse.extend({
  id: z.number().int().positive().optional(),
});

export const ZCrudFindOneRequest = ZBaseRequest.extend({
  id: z.number().int().positive('ID must be positive'),
});

export const ZCrudFindOneResponse = ZCrudModel.nullable();

export const ZCrudFindAllRequest = ZBaseRequest.extend({
  limit: z.number().int().positive().max(100).default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export const ZCrudFindAllResponse = ZBaseResponse.extend({
  cruds: z.array(ZCrudModel),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const ZCrudUpdateRequest = ZBaseRequest.extend({
  id: z.number().int().positive('ID must be positive'),
  data: z
    .object({
      content: z.string().min(1).max(1000),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const ZCrudUpdateResponse = ZBaseResponse.extend({
  data: ZCrudModel.optional(),
});

export const ZCrudDeleteRequest = ZBaseRequest.extend({
  id: z.number().int().positive('ID must be positive'),
});

export const ZCrudDeleteResponse = ZBaseResponse;

// Types
export type TCrudModel = z.infer<typeof ZCrudModel>;
export type TCrudCreateRequest = z.infer<typeof ZCrudCreateRequest>;
export type TCrudCreateResponse = z.infer<typeof ZCrudCreateResponse>;
export type TCrudFindOneRequest = z.infer<typeof ZCrudFindOneRequest>;
export type TCrudFindOneResponse = z.infer<typeof ZCrudFindOneResponse>;
export type TCrudFindAllRequest = z.infer<typeof ZCrudFindAllRequest>;
export type TCrudFindAllResponse = z.infer<typeof ZCrudFindAllResponse>;
export type TCrudUpdateRequest = z.infer<typeof ZCrudUpdateRequest>;
export type TCrudUpdateResponse = z.infer<typeof ZCrudUpdateResponse>;
export type TCrudDeleteRequest = z.infer<typeof ZCrudDeleteRequest>;
export type TCrudDeleteResponse = z.infer<typeof ZCrudDeleteResponse>;
