# Prisma Transaction Setup - Custom Client Type

## Overview

This project uses a **custom PrismaService** (which extends `PrismaClient`) instead of the default Prisma client. To make transactions work properly with `nestjs-cls`, we need to configure the adapter with our custom type.

## Type Alias Pattern

To avoid verbose type annotations, we've created a **type alias** for the transaction adapter.

### Files Structure

```
apps/api/src/modules/prisma/
├── prisma.service.ts              # Custom PrismaService (extends PrismaClient)
├── prisma.module.ts               # Module exports
├── prisma-transaction.types.ts   # Type alias for transactions
```

---

## Implementation

### 1. Type Alias (`prisma-transaction.types.ts`)

```typescript
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './prisma.service';

/**
 * Type alias for the Prisma transaction adapter with custom PrismaService
 * This avoids verbose type annotations throughout the codebase
 */
export type PrismaTransactionAdapter = TransactionalAdapterPrisma<PrismaService>;
```

**Why?** Without this, every repository would need:
```typescript
// ❌ VERBOSE (without alias)
constructor(
  private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaService>>
) {}

// ✅ CLEAN (with alias)
constructor(
  private readonly txHost: TransactionHost<PrismaTransactionAdapter>
) {}
```

---

### 2. PrismaModule Export (`prisma.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// Re-export transaction types for convenience
export * from './prisma-transaction.types';
```

This allows clean imports:
```typescript
// ✅ Import both from one place
import { PrismaService, PrismaTransactionAdapter } from '../../prisma/prisma.module';
```

---

### 3. Repository Pattern (`crud.repository.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaService, PrismaTransactionAdapter } from '../../prisma/prisma.module';

@Injectable()
export class CrudRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  // Helper to get the Prisma client (transactional or regular)
  private get prisma(): PrismaService {
    return this.txHost.tx as PrismaService;
  }

  async create(data: CreateDto) {
    // Automatically uses transaction context when available
    return this.prisma.crud.create({ data });
  }
}
```

**Key Points:**
- ✅ Inject `TransactionHost<PrismaTransactionAdapter>` (not `PrismaService` directly)
- ✅ Use `this.txHost.tx` to get the Prisma client
- ✅ The getter provides type-safe access to `PrismaService` methods

---

### 4. AppModule Configuration (`app.module.ts`)

```typescript
ClsModule.forRoot({
  global: true,
  middleware: {
    mount: true,
    generateId: true,
    idGenerator: (req) =>
      (req.headers as any)['x-request-id'] ?? crypto.randomUUID(),
  },
  plugins: [
    new ClsPluginTransactional({
      imports: [PrismaModule],
      adapter: new TransactionalAdapterPrisma({
        prismaInjectionToken: PrismaService,  // ← Use custom PrismaService
      }),
      enableTransactionProxy: true,
    }),
  ],
}),
```

**Critical:** `prismaInjectionToken: PrismaService` tells the adapter to use our custom service.

---

## How It Works

### Without Transaction (Normal Flow)

```typescript
Repository → txHost.tx → PrismaService → Database
                  ↓
            (Regular client, auto-commit)
```

### With @Transactional (Transaction Flow)

```typescript
Service [@Transactional]
    ↓
Repository → txHost.tx → Transactional PrismaClient → Database
                  ↓                          ↓
         (Transaction proxy)          (BEGIN → COMMIT/ROLLBACK)
```

**Magic:** `txHost.tx` returns:
- **Inside `@Transactional()`**: The transactional client (from CLS context)
- **Outside `@Transactional()`**: The regular PrismaService

---

## Usage Example

### Service with Transaction

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: ProfileRepository,
  ) {}

  @Transactional()
  async registerUser(data: RegisterDto) {
    // Both operations use the SAME transaction
    const user = await this.userRepo.create(data.user);
    const profile = await this.profileRepo.create({
      userId: user.id,
      ...data.profile,
    });

    // If profile creation fails, user creation rolls back too
    return { user, profile };
  }
}
```

### Repository (No Changes Needed)

```typescript
@Injectable()
export class UserRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionAdapter>,
  ) {}

  private get prisma() {
    return this.txHost.tx as PrismaService;
  }

  async create(data: CreateUserDto) {
    // Automatically uses transaction if available
    return this.prisma.user.create({ data });
  }
}
```

---

## Why Not Inject PrismaService Directly?

### ❌ Wrong (Breaks Transactions)

```typescript
@Injectable()
export class CrudRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDto) {
    // This bypasses the transaction proxy!
    return this.prisma.crud.create({ data });
  }
}
```

**Problem:** Direct injection uses the global PrismaService instance, which doesn't know about the CLS transaction context.

### ✅ Correct (Transactions Work)

```typescript
@Injectable()
export class CrudRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionAdapter>
  ) {}

  private get prisma() {
    return this.txHost.tx as PrismaService;
  }

  async create(data: CreateDto) {
    // This uses the transaction from CLS context
    return this.prisma.crud.create({ data });
  }
}
```

**Solution:** Use `TransactionHost` to get the correct client (transactional or regular).

---

## Testing Transactions

### Test Rollback

1. Add error in service after database operation:
```typescript
@Transactional()
async createCrud(data: CreateDto) {
  const created = await this.crudRepo.create(data);
  throw new Error('Test rollback');  // Simulate error
  return created;
}
```

2. Call the mutation and check database:
   - ✅ Error is thrown
   - ✅ Database has NO new record (rolled back)

3. Remove the error and test normal operation:
   - ✅ Record is created successfully

---

## Common Issues

### Issue 1: "Cannot read property 'tx' of undefined"

**Cause:** ClsModule not properly configured or middleware not mounted.

**Fix:** Ensure `app.module.ts` has:
```typescript
ClsModule.forRoot({
  middleware: { mount: true },  // ← Must be true
  plugins: [/* ... */]
})
```

### Issue 2: Transaction doesn't rollback

**Cause:** Repository injects `PrismaService` directly instead of `TransactionHost`.

**Fix:** Use the repository pattern shown above.

### Issue 3: Type errors with `txHost.tx`

**Cause:** Missing generic type parameter.

**Fix:** Use `TransactionHost<PrismaTransactionAdapter>` with the type alias.

---

## Benefits of This Approach

1. ✅ **Type Safety**: Full TypeScript support for PrismaService methods
2. ✅ **Clean Code**: No verbose type annotations in repositories
3. ✅ **Automatic**: Transactions work transparently without manual `$transaction()`
4. ✅ **Flexible**: Works with Prisma Client Extensions and custom methods
5. ✅ **Testable**: Easy to mock `TransactionHost` in unit tests

---

## References

- [nestjs-cls Transactional Plugin](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional)
- [Prisma Adapter Docs](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/prisma-adapter)
- [Custom Prisma Client Types](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/prisma-adapter#custom-client-type)

---

**Last Updated:** 2025-12-08
