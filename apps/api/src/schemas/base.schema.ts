import { z } from 'zod';

export const ZBaseRequest = z.object({
  requestId: z.string().uuid().optional(),
  timestamp: z.number().optional(),
});

export const ZBaseResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const BaseEntity = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TBaseRequest = z.infer<typeof ZBaseRequest>;
export type TBaseResponse = z.infer<typeof ZBaseResponse>;
export type Entity = z.infer<typeof BaseEntity>;
