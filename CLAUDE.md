# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern full-stack TypeScript monorepo using Turborepo, featuring:
- **Next.js** (Web app)
- **NestJS** (API backend)
- **Expo** (Mobile app)
- **tRPC** for type-safe API communication
- **Prisma + PostgreSQL** for database

**Package Manager**: Use `pnpm` exclusively. Never use npm or yarn.

## Essential Commands

### Development
```bash
# Run all apps concurrently
pnpm dev

# Run individual apps
pnpm dev:web    # Next.js on port 3000
pnpm dev:api    # NestJS on port 4000
pnpm dev:mobile # Expo mobile app

# Run mobile on specific platforms
cd apps/mobile
pnpm android    # Android emulator
pnpm ios        # iOS simulator
pnpm web        # Web browser
```

### Database Setup
```bash
# Start PostgreSQL + pgAdmin via Docker (from apps/api)
cd apps/api
docker-compose up -d

# Run migrations and generate Prisma client (from packages/prisma-db)
cd packages/prisma-db
pnpm prisma migrate deploy
pnpm prisma generate

# Create a new migration after schema changes
pnpm prisma migrate dev --name <migration_name>
```

### Building & Testing
```bash
# Build all apps
pnpm build

# Build individual apps
pnpm build:web
pnpm build:api

# Lint all code
pnpm lint
pnpm lint:fix

# Type checking
pnpm check-types

# API tests
cd apps/api
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage
pnpm test:e2e          # E2E tests
```

### Production
```bash
pnpm start           # Start all apps
pnpm start:web       # Next.js production
pnpm start:api       # NestJS production
```

## Architecture Overview

### Monorepo Structure
- **apps/api**: NestJS backend with tRPC integration via `nestjs-trpc`
- **apps/web**: Next.js 15 web frontend (App Router)
- **apps/mobile**: Expo mobile app with React Native
- **packages/trpc**: Shared tRPC router definitions and client setup
- **packages/prisma-db**: Prisma schema and migrations
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configurations

### tRPC Integration Pattern

**Key Concept**: The `packages/trpc/src/server/server.ts` file defines the tRPC contract (input/output schemas) but uses placeholder implementations. The actual implementations live in the NestJS API using `nestjs-trpc`.

#### Flow:
1. **Contract Definition** (`packages/trpc/src/server/server.ts`):
   - Defines procedures with Zod input/output schemas
   - Uses placeholder implementations: `async () => "PLACEHOLDER_DO_NOT_REMOVE" as any`
   - Exports `AppRouter` type for type-safe clients

2. **Implementation** (NestJS routers, e.g., `apps/api/src/crud/crud.router.ts`):
   - Uses `@Router()`, `@Query()`, `@Mutation()` decorators from `nestjs-trpc`
   - Implements actual business logic
   - Must match schema definitions from tRPC contract
   - Example: `CrudRouter` provides CRUD operations for the database

3. **Auto-Generation**:
   - `TRPCModule.forRoot()` in `apps/api/src/app.module.ts` auto-generates the server schema
   - Configuration: `autoSchemaFile: '../../packages/trpc/src/server'`
   - This syncs NestJS implementations with tRPC contract

4. **Client Usage** (Web & Mobile):
   - Import `trpc` client from `@repo/trpc/client`
   - Wrap app in `TrpcProvider` with API URL
   - Call procedures: `trpc.crud.findAll.useQuery()`

### Database & Prisma

- **Schema Location**: `packages/prisma-db/schema.prisma`
- **Generated Client Output**: `apps/api/src/generated/prisma`
- **PrismaService**: Singleton service in `apps/api/src/prisma/prisma.service.ts`
- The Prisma client is imported in NestJS services from the generated location

### NestJS Module Pattern

- Feature modules (e.g., `CrudModule`) contain:
  - `*.module.ts`: Module definition with imports/providers
  - `*.router.ts`: tRPC router implementation (decorated with `@Router()`)
  - `*.service.ts`: Business logic and database access
  - `*.schema.ts`: Zod schemas for request/response validation

### Environment Configuration

Required `.env` files:
- `apps/api/.env`: API server config (PORT, DATABASE_URL, CORS_ORIGINS)
- `apps/web/.env`: Web app config (NEXT_PUBLIC_TRPC_URL)
- `apps/app/.env`: Mobile app config (EXPO_PUBLIC_TRPC_URL, EXPO_PUBLIC_TRPC_URL_ANDROID)
- `packages/prisma-db/.env`: Database connection string

### Cross-Platform Considerations

- **Web**: Uses `process.env.NEXT_PUBLIC_TRPC_URL`
- **Mobile**:
  - iOS: Uses `process.env.EXPO_PUBLIC_TRPC_URL`
  - Android: Uses `process.env.EXPO_PUBLIC_TRPC_URL_ANDROID` (typically `http://10.0.2.2:4000` for emulator)

## Key Development Patterns

### Adding a New Feature with tRPC

1. **Define contract** in `packages/trpc/src/server/server.ts`:
   ```typescript
   myFeature: t.router({
     myProcedure: publicProcedure
       .input(z.object({ ... }))
       .output(z.object({ ... }))
       .query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
   })
   ```

2. **Create NestJS module** in `apps/api/src/my-feature/`:
   - `my-feature.module.ts`: Import `PrismaModule`, provide router and service
   - `my-feature.router.ts`: Implement with `@Router()`, `@Query()`, `@Mutation()`
   - `my-feature.service.ts`: Business logic using `PrismaService`
   - `my-feature.schema.ts`: Export Zod schemas and TypeScript types

3. **Import in AppModule**: Add `MyFeatureModule` to `apps/api/src/app.module.ts`

4. **Use in clients**: `trpc.myFeature.myProcedure.useQuery()` (React) or `.query()` (direct)

### Database Schema Changes

1. Modify `packages/prisma-db/schema.prisma`
2. Generate migration: `cd packages/prisma-db && pnpm prisma migrate dev --name <name>`
3. Regenerate client: `pnpm prisma generate` (if not auto-generated)
4. Update TypeScript types in services as needed

### Testing NestJS Services

- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `apps/api/test/*.e2e-spec.ts`
- Run from `apps/api` directory: `pnpm test` or `pnpm test:e2e`

## Important Notes

- **Docker must be running** for local development (PostgreSQL container)
- **CORS**: Configured in `apps/api/src/main.ts`, controlled by `CORS_ORIGINS` env var
- **API runs on port 4000** by default, web on 3000
- **Prisma migrations** are in `packages/prisma-db/migrations/`
- All NestJS routers must have matching schemas in the tRPC contract
- The `nestjs-trpc` library automatically syncs NestJS routers to the tRPC schema file
