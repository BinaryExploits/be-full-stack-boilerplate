# API code generation

Scripts that generate repository and related code for the API.

## Mongoose repository (`generate:repo:mongo`)

- **Command:** `pnpm run generate:repo:mongo <entityName> [--no-tenant]`
- **Requirement:** The entity name (e.g. `crud`, `global-crud`) must match a **type exported from `@repo/contracts`** (e.g. `Crud`, `GlobalCrud`). If the type does not exist in contracts, add it first under `packages/contracts/src/schemas/<domain>/schema.ts` and re-export from the package, then run the generator.
- Generated repositories import the domain type from `@repo/contracts`.

## Prisma repository (`generate:repo:prisma`)

- **Command:** `pnpm run generate:repo:prisma <entityName> [--no-tenant]`
- **Requirement:** The entity name must match a **model in `packages/prisma-db/schema.prisma`**. For tenant-scoped entities, the Prisma model should have a `tenantId` field; for global entities use `--no-tenant`.
