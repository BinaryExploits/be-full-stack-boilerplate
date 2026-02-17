import { z } from 'zod';
import {
  ZBaseEntity,
  ZBaseRequest,
  ZBaseResponse,
} from '../../../schemas/base.schema';

export const ZGlobalCrud = ZBaseEntity.extend({
  content: z.string().min(1).max(1000),
});

export const ZCreateGlobalCrudDto = ZGlobalCrud.pick({
  content: true,
});

export const ZUpdateGlobalCrudDto = ZGlobalCrud.pick({
  content: true,
});

export const ZGlobalCrudCreateRequest = ZBaseRequest.extend({
  content: z.string().min(1).max(1000),
});

export const ZGlobalCrudCreateResponse = ZBaseResponse.extend({
  id: z.string(),
});

export const ZGlobalCrudFindOneRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZGlobalCrudFindOneResponse = ZGlobalCrud.nullable();

export const ZGlobalCrudFindAllRequest = ZBaseRequest.extend({
  limit: z.number().int().positive().max(100).default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export const ZGlobalCrudFindAllResponse = ZBaseResponse.extend({
  items: z.array(ZGlobalCrud),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const ZGlobalCrudUpdateRequest = ZBaseRequest.extend({
  id: z.string(),
  data: ZUpdateGlobalCrudDto.refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const ZGlobalCrudUpdateResponse = ZBaseResponse.extend({
  data: ZGlobalCrud.optional(),
});

export const ZGlobalCrudDeleteRequest = ZBaseRequest.extend({
  id: z.string(),
});

export const ZGlobalCrudDeleteResponse = ZBaseResponse;

export type GlobalCrud = z.infer<typeof ZGlobalCrud>;
export type TGlobalCrudCreateRequest = z.infer<typeof ZGlobalCrudCreateRequest>;
export type TGlobalCrudCreateResponse = z.infer<typeof ZGlobalCrudCreateResponse>;
export type TGlobalCrudFindOneRequest = z.infer<typeof ZGlobalCrudFindOneRequest>;
export type TGlobalCrudFindOneResponse = z.infer<typeof ZGlobalCrudFindOneResponse>;
export type TGlobalCrudFindAllRequest = z.infer<typeof ZGlobalCrudFindAllRequest>;
export type TGlobalCrudFindAllResponse = z.infer<typeof ZGlobalCrudFindAllResponse>;
export type TGlobalCrudUpdateRequest = z.infer<typeof ZGlobalCrudUpdateRequest>;
export type TGlobalCrudUpdateResponse = z.infer<typeof ZGlobalCrudUpdateResponse>;
export type TGlobalCrudDeleteRequest = z.infer<typeof ZGlobalCrudDeleteRequest>;
export type TGlobalCrudDeleteResponse = z.infer<typeof ZGlobalCrudDeleteResponse>;
