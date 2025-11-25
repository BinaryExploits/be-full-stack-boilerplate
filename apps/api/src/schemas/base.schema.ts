import { z } from 'zod';

export const ZBaseRequest = z.object({
  requestId: z.string().uuid().optional(),
  timestamp: z.number().optional(),
});

export const ZBaseResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type TBaseRequest = z.infer<typeof ZBaseRequest>;
export type TBaseResponse = z.infer<typeof ZBaseResponse>;
