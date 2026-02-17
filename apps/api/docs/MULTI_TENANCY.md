# Multi-tenancy

The app supports **multi-tenant** resolution by host/origin. **Constraint:** at least one tenant must exist (e.g. seed includes a **localhost** tenant). There is **no default tenant**; if resolution cannot resolve a tenant, **tenant-scoped requests are rejected** (403) and no data is returned.

## Ready to execute (migration + seed)

1. **Start DB** (if not already running):
   ```bash
   pnpm run docker:start
   ```
2. **Run migration and seed** (creates `tenant` table, adds `crud.tenantId`, seeds four tenants: localhost, binaryexports, binaryexperiments, binaryexploits):

   ```bash
   pnpm run db:ready
   ```

   This runs `prisma migrate deploy` then `prisma db seed` from `packages/prisma-db`. Ensure `packages/prisma-db/.env` has `DATABASE_URL` pointing at your Postgres.

3. **Env** (in `apps/api/.env`): `CORS_ORIGINS`, `SUPER_ADMIN_EMAILS`, and `BETTER_AUTH_TRUSTED_ORIGINS` should include all tenant origins (see `.env.example`). Default seed assumes super-admin emails like `anns.shahbaz@binaryexports.com` (and same for binaryexperiments / binaryexploits).

4. **Launch**: `pnpm run dev` (or `dev:api` / `dev:web`). Access per-tenant locally via `http://localhost:3000` (localhost tenant), `http://binaryexports.localhost:3000`, `http://binaryexperiments.localhost:3000`, `http://binaryexploits.localhost:3000` (and production domains when deployed).

## How to verify tenant isolation

1. **Use different subdomains**: Open the app in two tabs/windows:
   - Tab A: `http://binaryexports.localhost:3000` (or `http://binaryexploits.localhost:3000`)
   - Tab B: `http://binaryexperiments.localhost:3000`
2. **CRUD Demo**: In Tab A, create a CRUD item (e.g. "Only for tenant A"). In Tab B, open the CRUD Demo and list items — you should **not** see the item from Tab A. Each subdomain sees only its tenant’s data.
3. **Why it works**: The frontend sends the current page origin in the `x-tenant-origin` header on every tRPC request. The API resolves the tenant from that (or from `Origin`/`Host` when not proxied) and scopes all Crud reads/writes to that tenant. If you previously saw the same data everywhere, the request was likely reaching the API without the correct origin (e.g. after a proxy); the client now sends `x-tenant-origin` so resolution works even when the request is rewritten.

## How it works

1. **Tenant resolution and gate** (per request): A single `TenantMiddleware` runs for each request. It enters a request-scoped store (so the Prisma extension and `@Transactional` see the tenant id), reads `x-tenant-origin` (or `Origin`) and `Host`, normalizes them, and looks up a tenant whose `allowedOrigins` **exactly** match one of those normalized hosts. There is **no parent-domain fallback**; only registered hosts/origins get a tenant. Unregistered subdomains (e.g. `random.localhost`) do not match the `localhost` tenant. If no tenant was resolved and the path is not in the skip list (e.g. `/api/auth`), the request is **rejected with 403** in the same middleware. Debug logging: resolution logs `[TenantResolution]` with host/origin and resolved tenant; rejections log `[RequireTenant]` with path and host/origin.
3. **Tenant context**: The resolved tenant is stored in **CLS** (request-scoped). Services and repositories never receive a tenant argument; they read from `TenantContext` or the tenant is applied automatically.
4. **Data isolation**:
   - **Prisma**: The Prisma client is extended with a **tenant extension** (`prisma-tenant.extension.ts`) that scopes all `Crud` model operations to the current tenant (from a request-scoped store set in `TenantMiddleware`). `PrismaService` uses this extended client; `CrudPrismaRepository` delegates directly to it. When no tenant is resolved, the extension throws (403).
   - **Mongoose**: Repositories that receive `tenantContext` (e.g. `CrudMongooseRepository`) add `tenantId` to filters and to created documents; when no tenant is resolved, the request is rejected (403). Repositories without `tenantContext` are not tenant-scoped.

Developers writing services or repository code do **not** need to pass or check tenant; isolation is handled in middleware, the Prisma tenant extension, and tenant-scoped Mongoose repositories.

## Single-tenant

- Create **one** tenant with `allowedOrigins` set to your main app origin(s) (e.g. `["company.com", "https://company.com"]`). All requests that match that origin use that tenant. There is no fallback for unmatched origins.

## Adding more tenants (e.g. abc.company.com, xyz.company.com)

1. **Run migration** (if not already):
   ```bash
   cd packages/prisma-db && pnpm exec prisma migrate deploy
   ```
2. **Create tenants** via super-admin (each must have `allowedOrigins` that match how users reach the app):
   - Call `tenant.create` with `name`, `slug`, and `allowedOrigins: ["abc.company.com", "https://abc.company.com"]` (and optionally more entries).
   - Only exact host/origin is matched; add every origin you use (e.g. company.com and subdomains) to the tenant's allowedOrigins. (e.g. unknown subdomains resolve to company.com), add `company.com` (and variants) to a “root” tenant’s `allowedOrigins`; (e.g. company.com and subdomains) to the tenant's allowedOrigins.
   - Repeat for `xyz.company.com` etc.
4. **CORS**: Add all tenant origins to your API env so the browser allows requests:
   ```env
   CORS_ORIGINS=https://abc.company.com,https://xyz.company.com,http://localhost:3000
   ```
5. **Super-admin**: Restrict who can create/edit tenants with:
   ```env
   SUPER_ADMIN_EMAILS=admin@company.com,super@company.com
   ```
   Only these users (after login) can call `tenant.*` procedures.

## tRPC routes

- **Super-admin only**: `tenant.create`, `tenant.findAll`, `tenant.findOne`, `tenant.update`, `tenant.delete`  
  Protected by `AuthMiddleware` + `SuperAdminGuard` (checks `SUPER_ADMIN_EMAILS`).

## Env summary

| Env var                       | Purpose                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| `CORS_ORIGINS`                | Comma-separated allowed frontend origins (include all tenant domains). |
| `SUPER_ADMIN_EMAILS`          | Comma-separated emails that can manage tenants (tenant.\* tRPC).       |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Same origins as CORS for auth/cookies (Better Auth).                   |

## Seeded tenants

The Prisma seed (`packages/prisma-db/seed.ts`) runs `TenantSeeder`, which upserts four tenants (including **localhost** so bare `localhost:3000` resolves). Each is resolved only when the request host/origin matches one of its `allowedOrigins` (no default tenant).

| Slug                | Name               | Origins (examples)                              |
| ------------------- | ------------------ | ----------------------------------------------- |
| `localhost`         | Localhost          | localhost, localhost:3000, 127.0.0.1…           |
| `binaryexports`     | Binary Exports     | binaryexports.com, binaryexports.localhost…    |
| `binaryexperiments` | Binary Experiments | binaryexperiments.com, binaryexperiments.localhost… |
| `binaryexploits`    | Binary Exploits    | binaryexploits.com, binaryexploits.localhost…   |

Unmatched requests have **no tenant** (tenant-scoped APIs **reject** with 403 and return no data).
