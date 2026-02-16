type GetTenantId = () => string | null;

/**
 * Prisma extension that scopes Crud model by tenant. When getTenantId() returns a value,
 * all reads/writes for Crud are filtered/injected by tenantId. When null, no tenant
 * filter is applied (single-tenant or backward compatibility).
 */
export function prismaTenantExtension(getTenantId: GetTenantId) {
  return {
    name: 'tenantScope',
    query: {
      crud: {
          async findMany({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where?: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async findFirst({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where?: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async findUnique({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              const w = (args as { where: object }).where as object;
              (args as { where: object }).where = { ...w, tenantId };
            }
            return query(args);
          },
          async create({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { data: { tenantId?: string } }).data = {
                ...(args as { data: object }).data,
                tenantId,
              };
            }
            return query(args);
          },
          async createMany({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null && (args as { data: object | object[] }).data) {
              const data = (args as { data: object | object[] }).data;
              const arr = Array.isArray(data)
                ? data.map((d) => ({ ...d, tenantId }))
                : { ...data, tenantId };
              (args as { data: object }).data = arr as object;
            }
            return query(args);
          },
          async update({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async updateMany({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where?: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async delete({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async deleteMany({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              (args as { where?: { tenantId?: string } }).where = {
                ...(args as { where?: object }).where,
                tenantId,
              };
            }
            return query(args);
          },
          async upsert({ args, query }) {
            const tenantId = getTenantId();
            if (tenantId != null) {
              const a = args as {
                where: object;
                create: object;
                update: object;
              };
              a.where = { ...a.where, tenantId };
              a.create = { ...a.create, tenantId };
              a.update = { ...a.update, tenantId };
            }
            return query(args);
          },
        },
      },
    };
}
