import { Prisma } from '@repo/prisma-db';

const TENANT_REQUIRED_MSG =
  'Tenant could not be resolved from request origin; tenant-scoped data is not available.';

function requireTenantId(getTenantId: () => string | null): string {
  const tenantId = getTenantId();
  if (tenantId == null) {
    const err = new Error(TENANT_REQUIRED_MSG) as Error & {
      statusCode?: number;
    };
    err.statusCode = 403;
    throw err;
  }
  return tenantId;
}

function mergeWhere<T extends { where?: Prisma.CrudWhereInput } | undefined>(
  args: T,
  tenantId: string,
): T {
  const baseWhere: Prisma.CrudWhereInput = { tenantId };
  if (args == null) {
    return { where: baseWhere } as T;
  }
  return {
    ...args,
    where: { ...args.where, tenantId } as Prisma.CrudWhereInput,
  } as T;
}

/**
 * Prisma client extension that scopes all Crud model operations to the current tenant
 * (from TenantContext via CLS). Rejects with an error when no tenant is set.
 * getTenantId is called at query time and should return the current request's tenant id (e.g. from TenantContext.getTenantId()).
 */
export function createPrismaTenantExtension(
  getTenantId: () => string | null,
): ReturnType<typeof Prisma.defineExtension> {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'tenant',
      query: {
        crud: {
          async findFirst({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async findUnique({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async findMany({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async create({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            const data = {
              ...args.data,
              tenantId,
            } as unknown as Prisma.CrudCreateInput;
            return query({ ...args, data });
          },
          async createMany({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            const data = Array.isArray(args.data)
              ? args.data.map((row) => ({ ...row, tenantId }))
              : { ...args.data, tenantId };
            return query({ ...args, data } as Prisma.CrudCreateManyArgs);
          },
          async update({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async updateMany({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async upsert({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            const where = {
              ...args.where,
              tenantId,
            } as Prisma.CrudWhereUniqueInput;
            const create = {
              ...args.create,
              tenantId,
            } as unknown as Prisma.CrudCreateInput;
            const update = {
              ...args.update,
              tenantId,
            } as unknown as Prisma.CrudUpdateInput;
            return query({ ...args, where, create, update });
          },
          async delete({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async deleteMany({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async count({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
          async aggregate({ args, query }) {
            const tenantId = requireTenantId(getTenantId);
            return query(mergeWhere(args, tenantId));
          },
        },
      },
    });
  });
}
