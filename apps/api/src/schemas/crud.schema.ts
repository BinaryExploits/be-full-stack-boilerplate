import { z } from 'zod';
import { ZBaseRequest, ZBaseResponse } from './base.schema';

export const ZCrudEntity = z.object({
  id: z.string(),
  content: z.string().min(1).max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ZCreateCrudDto = ZCrudEntity.pick({
  content: true,
});

export const ZUpdateCrudDto = ZCrudEntity.pick({
  content: true,
});

export const ZCrudCreateRequest = ZBaseRequest.merge(ZCreateCrudDto);

export const ZCrudCreateResponse = ZBaseResponse.extend({
  id: z.string(),
});

export const ZCrudFindOneRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZCrudFindOneResponse = ZCrudEntity.nullable();

export const ZCrudFindAllRequest = ZBaseRequest.extend({
  limit: z.number().int().positive().max(100).default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export const ZCrudFindAllResponse = ZBaseResponse.extend({
  cruds: z.array(ZCrudEntity),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const ZCrudUpdateRequest = ZBaseRequest.extend({
  id: z.string(),
  data: ZUpdateCrudDto.refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const ZCrudUpdateResponse = ZBaseResponse.extend({
  data: ZCrudEntity.optional(),
});

export const ZCrudDeleteRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZCrudDeleteResponse = ZBaseResponse;

export type CrudEntity = z.infer<typeof ZCrudEntity>;
export type CreateCrudDto = z.infer<typeof ZCreateCrudDto>;
export type UpdateCrudDto = z.infer<typeof ZUpdateCrudDto>;

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
