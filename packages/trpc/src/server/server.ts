import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  tenant: t.router({
    isSuperAdmin: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      isSuperAdmin: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    myTenants: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      tenants: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
        }),
      ),
      selectedTenantId: z.string().nullable(),
      singleTenantMode: z.boolean(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    switchTenant: publicProcedure.input(z.object({}).extend({
      tenantId: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      selectedTenantId: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    create: publicProcedure.input(z.object({}).extend({
      name: z.string().min(1).max(255),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/),
      allowedOrigins: z.array(z.string().min(1)).optional().default([]),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      name: z.string(),
      slug: z.string(),
      allowedOrigins: z.array(z.string()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAll: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      tenants: z.array(z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        name: z.string(),
        slug: z.string(),
        allowedOrigins: z.array(z.string()),
      })),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOne: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      name: z.string(),
      slug: z.string(),
      allowedOrigins: z.array(z.string()),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    update: publicProcedure.input(z.object({}).extend({
      id: z.string(),
      name: z.string().min(1).max(255).optional(),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      allowedOrigins: z.array(z.string().min(1)).optional(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      name: z.string(),
      slug: z.string(),
      allowedOrigins: z.array(z.string()),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    delete: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addMember: publicProcedure.input(z.object({}).extend({
      email: z.string().email(),
      tenantId: z.string(),
      role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.string(),
      email: z.string(),
      tenantId: z.string(),
      role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    removeMember: publicProcedure.input(z.object({}).extend({
      email: z.string().email(),
      tenantId: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    listMembers: publicProcedure.input(z.object({}).extend({
      tenantId: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      members: z.array(
        z.object({
          id: z.string(),
          email: z.string(),
          tenantId: z.string(),
          role: z.enum(['TENANT_ADMIN', 'TENANT_USER']),
        }),
      ),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  crud: t.router({
    createCrudMongo: publicProcedure.input(z.object({}).extend({
      content: z.string().min(1).max(1000),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAllMongo: publicProcedure.input(z.object({}).extend({
      limit: z.number().int().positive().max(100).default(10).optional(),
      offset: z.number().int().nonnegative().default(0).optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      cruds: z.array(z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      })),
      total: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOneCrudMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      content: z.string().min(1).max(1000),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateCrudMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).pick({
        content: true,
      }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteCrudMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createCrudPrisma: publicProcedure.input(z.object({}).extend({
      content: z.string().min(1).max(1000),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAllPrisma: publicProcedure.input(z.object({}).extend({
      limit: z.number().int().positive().max(100).default(10).optional(),
      offset: z.number().int().nonnegative().default(0).optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      cruds: z.array(z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      })),
      total: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOneCrudPrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      content: z.string().min(1).max(1000),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateCrudPrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).pick({
        content: true,
      }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteCrudPrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  globalCrud: t.router({
    createMongo: publicProcedure.input(z.object({}).extend({
      content: z.string().min(1).max(1000),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAllMongo: publicProcedure.input(z.object({}).extend({
      limit: z.number().int().positive().max(100).default(10).optional(),
      offset: z.number().int().nonnegative().default(0).optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      })),
      total: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOneMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      content: z.string().min(1).max(1000),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).pick({
        content: true,
      }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteMongo: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createPrisma: publicProcedure.input(z.object({}).extend({
      content: z.string().min(1).max(1000),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      id: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findAllPrisma: publicProcedure.input(z.object({}).extend({
      limit: z.number().int().positive().max(100).default(10).optional(),
      offset: z.number().int().nonnegative().default(0).optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      items: z.array(z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      })),
      total: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findOnePrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      content: z.string().min(1).max(1000),
    }).nullable()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).pick({
        content: true,
      }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      data: z.object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        content: z.string().min(1).max(1000),
      }).optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deletePrisma: publicProcedure.input(z.object({}).extend({
      id: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  gdpr: t.router({ ,
    myData: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
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
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    exportData: publicProcedure.output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
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
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateProfile: publicProcedure.input(z.object({}).extend({
      name: z
        .string()
        .min(2)
        .max(100)
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
        .optional(),
      image: z.string().max(2048).nullable().optional(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }).extend({
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        image: z.string().nullable(),
        updatedAt: z.date(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deleteAccount: publicProcedure.input(z.object({}).extend({
      confirmation: z.string(),
    })).output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

