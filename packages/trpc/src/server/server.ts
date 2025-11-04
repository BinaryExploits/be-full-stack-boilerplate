import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  crud: t.router({
    createCrud: publicProcedure.input(z.object({
      requestId: z.string().uuid().optional(),
      timestamp: z.number().optional(),
    }).extend({
      content: z
        .string()
        .min(1, 'Content cannot be empty')
        .max(500, 'Content too long'),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.number().int().positive().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.input(z.object({
      requestId: z.string().uuid().optional(),
      timestamp: z.number().optional(),
    }).extend({
      limit: z.number().int().positive().max(100).default(10).optional(),
      offset: z.number().int().nonnegative().default(0).optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      cruds: z.array(z.object({
        id: z.number().int().positive(),
        content: z.string().min(1).max(1000),
      })),
      total: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOneCrud: publicProcedure.input(z.object({
      requestId: z.string().uuid().optional(),
      timestamp: z.number().optional(),
    }).extend({
      id: z.number().int().positive('ID must be positive'),
    })).output(z.object({
      id: z.number().int().positive(),
      content: z.string().min(1).max(1000),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateCrud: publicProcedure.input(z.object({
      requestId: z.string().uuid().optional(),
      timestamp: z.number().optional(),
    }).extend({
      id: z.number().int().positive('ID must be positive'),
      data: z
        .object({
          content: z.string().min(1).max(1000),
        })
        .refine((data) => Object.keys(data).length > 0, {
          message: 'At least one field must be provided for update',
        }),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      data: z.object({
        id: z.number().int().positive(),
        content: z.string().min(1).max(1000),
      }).optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteCrud: publicProcedure.input(z.object({
      requestId: z.string().uuid().optional(),
      timestamp: z.number().optional(),
    }).extend({
      id: z.number().int().positive('ID must be positive'),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

