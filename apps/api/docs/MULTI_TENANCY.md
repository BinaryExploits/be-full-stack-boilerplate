# Multi-tenancy

The app supports **single-tenant by default** and **multi-tenant** when you add more tenants and origins.

## Ready to execute (migration + seed)

1. **Start DB** (if not already running):
   ```bash
   pnpm run docker:start
   ```
2. **Run migration and seed** (creates `tenant` table, adds `crud.tenantId`, seeds three tenants: binaryexports, binaryexperiments, binaryexploits):
   ```bash
   pnpm run db:ready
   ```
   This runs `prisma migrate deploy` then `prisma db seed` from `packages/prisma-db`. Ensure `packages/prisma-db/.env` has `DATABASE_URL` pointing at your Postgres.

3. **Env** (in `apps/api/.env`): `CORS_ORIGINS`, `SUPER_ADMIN_EMAILS`, and `BETTER_AUTH_TRUSTED_ORIGINS` should include all tenant origins (see `.env.example`). Default seed assumes super-admin emails like `anns.shahbaz@binaryexports.com` (and same for binaryexperiments / binaryexploits).

4. **Launch**: `pnpm run dev` (or `dev:api` / `dev:web`). Access per-tenant locally via `http://binaryexports.localhost:3000`, `http://binaryexperiments.localhost:3000`, `http://binaryexploits.localhost:3000` (and production domains when deployed).

## How to verify tenant isolation

1. **Use different subdomains**: Open the app in two tabs/windows:
   - Tab A: `http://binaryexports.localhost:3000` (or `http://binaryexploits.localhost:3000`)
   - Tab B: `http://binaryexperiments.localhost:3000`
2. **CRUD Demo**: In Tab A, create a CRUD item (e.g. "Only for tenant A"). In Tab B, open the CRUD Demo and list items — you should **not** see the item from Tab A. Each subdomain sees only its tenant’s data.
3. **Why it works**: The frontend sends the current page origin in the `x-tenant-origin` header on every tRPC request. The API resolves the tenant from that (or from `Origin`/`Host` when not proxied) and scopes all Crud reads/writes to that tenant. If you previously saw the same data everywhere, the request was likely reaching the API without the correct origin (e.g. after a proxy); the client now sends `x-tenant-origin` so resolution works even when the request is rewritten.

## How it works

1. **Tenant resolution** (per request): The `TenantResolutionMiddleware` reads `Host`, `Origin`, or the frontend-sent `x-tenant-origin` header and looks up a tenant by `allowedOrigins`. If none match, a tenant with `isDefault: true` is used (single-tenant mode).
2. **Tenant context**: The resolved tenant is stored in **CLS** (request-scoped). Services and repositories never receive a tenant argument; they read from `TenantContext` or the tenant is applied automatically.
3. **Data isolation**:  
   - **Prisma**: The `Crud` model is tenant-scoped via a Prisma extension; `tenantId` is injected on create and all reads/updates/deletes are filtered by it.  
   - **Mongoose**: Repositories that opt in with `tenantScoped: true` (e.g. `CrudMongooseRepository`) automatically add `tenantId` to filters and to created documents.

Developers writing services or repository code do **not** need to pass or check tenant; isolation is handled in middleware, Prisma extension, and base repository.

## Single-tenant (default)

- Create **one** tenant with `isDefault: true` and leave `allowedOrigins` empty or set to your main app origin(s).
- All requests use that tenant. Behavior is the same as before multi-tenancy.

## Adding more tenants (e.g. abc.company.com, xyz.company.com)

1. **Run migration** (if not already):
   ```bash
   cd packages/prisma-db && pnpm exec prisma migrate deploy
   ```
2. **Create a default tenant** (for single-tenant or fallback):
   - Use the **super-admin** tRPC route `tenant.create` with `isDefault: true` and your main origin(s), or insert one in the DB.
3. **Create additional tenants** via super-admin:
   - Call `tenant.create` with `name`, `slug`, and `allowedOrigins: ["abc.company.com", "https://abc.company.com"]` (and optionally more entries).
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

| Env var                       | Purpose |
|-------------------------------|--------|
| `CORS_ORIGINS`                | Comma-separated allowed frontend origins (include all tenant domains). |
| `SUPER_ADMIN_EMAILS`          | Comma-separated emails that can manage tenants (tenant.* tRPC). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Same origins as CORS for auth/cookies (Better Auth). |

## Default tenants (seed)

The Prisma seed (`packages/prisma-db/seed.ts`) runs `TenantSeeder`, which upserts three tenants:

| Slug              | Name              | Default | Origins (examples) |
|-------------------|-------------------|--------|---------------------|
| `binaryexports`   | Binary Exports    | No     | binaryexports.com, binaryexports.localhost:3000 |
| `binaryexperiments` | Binary Experiments | No   | binaryexperiments.com, binaryexperiments.localhost:3000 |
| `binaryexploits` | Binary Exploits   | **Yes** | binaryexploits.com, binaryexploits.localhost:3000 |

Unmatched requests use the default tenant (`binaryexploits`). To change which is default, update the seed or use `tenant.update` (super-admin).
