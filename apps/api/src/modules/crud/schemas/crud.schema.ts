import { z } from 'zod';
import {
  ZBaseEntity,
  ZBaseRequest,
  ZBaseResponse,
} from '../../../schemas/base.schema';

export const ZCrud = ZBaseEntity.extend({
  content: z.string().min(1).max(1000),
});

export const ZCreateCrudDto = ZCrud.pick({
  content: true,
});

export const ZUpdateCrudDto = ZCrud.pick({
  content: true,
});

export const ZCrudCreateRequest = ZBaseRequest.extend({
  content: z.string().min(1).max(1000),
});

export const ZCrudCreateResponse = ZBaseResponse.extend({
  id: z.string(),
});

export const ZCrudFindOneRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZCrudFindOneResponse = ZCrud.nullable();

export const ZCrudFindAllRequest = ZBaseRequest.extend({
  limit: z.number().int().positive().max(100).default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export const ZCrudFindAllResponse = ZBaseResponse.extend({
  cruds: z.array(ZCrud),
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
  data: ZCrud.optional(),
});

export const ZCrudDeleteRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZCrudDeleteResponse = ZBaseResponse;

export type Crud = z.infer<typeof ZCrud>;
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
