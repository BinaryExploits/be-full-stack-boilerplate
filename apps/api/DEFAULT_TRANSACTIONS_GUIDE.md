# Making Transactions Default in NestJS + tRPC

## ⚠️ Important Discovery

**tRPC Router Middleware with `@Transactional()` DOES NOT WORK** because tRPC's middleware execution doesn't properly propagate the CLS (AsyncLocalStorage) context where transactions are stored.

## ✅ Correct Approach

**Put `@Transactional()` on SERVICE METHODS**, not on routers or middleware.

---

## Table of Contents

1. [Correct Approach: Service-Level Transactions](#correct-approach-service-level-transactions)
2. [Why Router Middleware Doesn't Work](#why-router-middleware-doesnt-work)
3. [Optional: Base Service Class](#optional-base-service-class)
4. [Best Practices](#best-practices)

---

## Correct Approach: Service-Level Transactions

### Implementation (Current & Working)

Put `@Transactional()` directly on service methods that need transactions:

```typescript
// crud.service.ts
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  // ✅ Add @Transactional to each write method
  @Transactional()
  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    const created = await this.crudRepository.create(data);

    // If any operation fails, entire transaction rolls back
    await this.auditRepository.log({ action: 'CREATED', id: created.id });

    return created;
  }

  // ✅ Transactions on updates
  @Transactional()
  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity> {
    const updated = await this.crudRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  // ✅ Transactions on deletes
  @Transactional()
  async delete(id: string): Promise<CrudEntity> {
    const deleted = await this.crudRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    return deleted;
  }

  // ❌ No transaction needed for reads
  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  async findOne(id: string): Promise<CrudEntity> {
    const crud = await this.crudRepository.findOne(id);
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }
}
```

### Transaction Flow

```
Client Request
    ↓
tRPC Router Method
    ↓
Service Method [@Transactional starts here]
    ↓
[TRANSACTION STARTS]
    ↓
Repository Method (uses txHost.tx)
    ↓
Database Operations (in transaction)
    ↓
[TRANSACTION COMMITS or ROLLS BACK]
    ↓
Response to Client
```

---

## Why Router Middleware Doesn't Work

### What We Tried (Didn't Work)

Apply `TransactionMiddleware` at the **Router class level** to make all procedures in that router transactional by default.

### Implementation

#### 1. Transaction Middleware (`middleware/transaction.middleware.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';

/**
 * Global transaction middleware for tRPC
 * Automatically wraps all mutations in transactions
 */
@Injectable()
export class TransactionMiddleware implements TRPCMiddleware {
  @Transactional()
  async use(opts: MiddlewareOptions): Promise<unknown> {
    const { next } = opts;

    // The @Transactional decorator handles everything
    return next();
  }
}
```

#### 2. Apply to Router (`crud.router.ts`)

```typescript
import { TransactionMiddleware } from '../../middleware/transaction.middleware';

// Apply to ALL procedures in this router
@UseMiddlewares(TransactionMiddleware)
@Router({ alias: 'crud' })
export class CrudRouter {
  constructor(private readonly crudService: CrudService) {}

  // ✅ Automatically transactional (no decorator needed)
  @Mutation({ input: ZCreateRequest, output: ZCreateResponse })
  async createCrud(@Input() req: CreateRequest) {
    return this.crudService.createCrud(req);
  }

  // ✅ Automatically transactional
  @Mutation({ input: ZUpdateRequest, output: ZUpdateResponse })
  async updateCrud(@Input() req: UpdateRequest) {
    return this.crudService.update(req.id, req.data);
  }

  // ✅ Also transactional (but reads don't need transactions usually)
  @Query({ input: ZFindAllRequest, output: ZFindAllResponse })
  async findAll(@Input() req: FindAllRequest) {
    return this.crudService.findAll();
  }
}
```

#### 3. Register Middleware in Module (`crud.module.ts`)

```typescript
@Module({
  imports: [PrismaModule],
  providers: [
    CrudRepository,
    CrudService,
    CrudRouter,
    TransactionMiddleware  // ← Register here
  ],
  exports: [CrudRepository, CrudService],
})
export class CrudModule {}
```

#### 4. Service (No Decorators Needed)

```typescript
@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  // ✅ Automatically transactional (router middleware handles it)
  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    const created = await this.crudRepository.create(data);

    // If this fails, transaction rolls back automatically
    await this.auditRepository.log({ action: 'CREATED', id: created.id });

    return created;
  }

  // ✅ Also transactional
  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity> {
    return this.crudRepository.update(id, data);
  }

  // Reads don't need transactions, but they're harmless
  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }
}
```

### Execution Flow

```
Client Request
    ↓
tRPC Router → TransactionMiddleware [@Transactional]
    ↓
[TRANSACTION STARTS]
    ↓
Router Method (createCrud)
    ↓
Service Method (no decorator needed)
    ↓
Repository Method (uses txHost.tx)
    ↓
Database Operations (in transaction)
    ↓
[TRANSACTION COMMITS or ROLLS BACK]
    ↓
Response to Client
```

### Pros & Cons

✅ **Pros:**
- No decorators needed on services or methods
- Clean, DRY code
- Easy to apply to entire router at once
- Middleware executes BEFORE AuthMiddleware (if both are applied)

❌ **Cons:**
- Applies to ALL procedures (including Queries that don't need transactions)
- One transaction per router procedure (can't have multiple independent transactions in same handler)

---

## Approach 2: Custom Base Service Class

Create a base service class that automatically wraps all methods in transactions.

### Implementation

#### 1. Base Service (`base/transactional-base.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';

/**
 * Base service that makes all methods transactional by default
 * Extend this class to get automatic transaction support
 */
@Injectable()
export abstract class TransactionalBaseService {
  /**
   * Override this method in subclasses to customize transaction behavior
   */
  protected get transactionOptions() {
    return {
      timeout: 10000,  // 10 seconds
      isolationLevel: 'ReadCommitted' as const,
    };
  }

  /**
   * Wrap any method call in a transaction
   */
  @Transactional()
  protected async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}
```

#### 2. Service Extends Base

```typescript
@Injectable()
export class CrudService extends TransactionalBaseService {
  constructor(private readonly crudRepository: CrudRepository) {
    super();
  }

  // ❌ This approach doesn't work well - need manual wrapping
  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    return this.withTransaction(async () => {
      const created = await this.crudRepository.create(data);
      await this.auditRepository.log({ action: 'CREATED' });
      return created;
    });
  }
}
```

### Pros & Cons

⚠️ **Not Recommended:**
- Still requires manual wrapping with `withTransaction()`
- More boilerplate than router middleware approach
- Doesn't truly make things "automatic"

---

## Approach 3: Global Interceptor

Use NestJS interceptor to wrap ALL requests in transactions (not tRPC-specific).

### Implementation

#### 1. Global Transaction Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class GlobalTransactionInterceptor implements NestInterceptor {
  @Transactional()
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Simply pass through - @Transactional handles the rest
    return next.handle();
  }
}
```

#### 2. Register Globally in `main.ts`

```typescript
import { GlobalTransactionInterceptor } from './interceptors/transaction.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply globally to ALL requests
  app.useGlobalInterceptors(new GlobalTransactionInterceptor());

  await app.listen(4000);
}
```

### Pros & Cons

✅ **Pros:**
- Truly global - applies to ALL requests (tRPC, REST, GraphQL)
- No need to modify routers or services

❌ **Cons:**
- Too broad - wraps EVERYTHING (including health checks, static files)
- May cause performance issues for read-heavy operations
- Harder to opt-out for specific endpoints
- Doesn't work well with tRPC's middleware system

⚠️ **Not Recommended for tRPC apps**

---

## Comparison & Recommendations

| Approach | Granularity | Ease of Use | Performance | Opt-Out |
|----------|-------------|-------------|-------------|---------|
| **Router Middleware** | Per Router | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Easy |
| Base Service | Per Method | ⭐⭐ | ⭐⭐⭐⭐⭐ | Manual |
| Global Interceptor | All Requests | ⭐⭐⭐⭐ | ⭐⭐ | Hard |

### 🏆 **Recommended: Router-Level Middleware**

**Why?**
1. ✅ Clean code - no decorators on services
2. ✅ Granular control - apply per router
3. ✅ Easy opt-out - use `@UseMiddlewares()` selectively
4. ✅ Works naturally with tRPC
5. ✅ Good performance - only applies to tRPC procedures

---

## Optimizing for Read vs Write

If you want transactions **only for mutations** (not queries), create two middlewares:

### Mutation-Only Transactions

```typescript
// middleware/mutation-transaction.middleware.ts
@Injectable()
export class MutationTransactionMiddleware implements TRPCMiddleware {
  @Transactional()
  async use(opts: MiddlewareOptions): Promise<unknown> {
    return opts.next();
  }
}

// Apply only to mutations
@Router({ alias: 'crud' })
export class CrudRouter {
  // ✅ Transactional
  @UseMiddlewares(MutationTransactionMiddleware)
  @Mutation({ input: ZCreateRequest, output: ZCreateResponse })
  async createCrud(@Input() req: CreateRequest) {
    return this.crudService.createCrud(req);
  }

  // ✅ No transaction (faster for reads)
  @Query({ input: ZFindAllRequest, output: ZFindAllResponse })
  async findAll(@Input() req: FindAllRequest) {
    return this.crudService.findAll();
  }
}
```

**But:** Router-level middleware already applies to all, so just use:

```typescript
@UseMiddlewares(TransactionMiddleware)  // ← All procedures
@Router({ alias: 'crud' })
```

Queries in transactions are fine - they just use a read-only snapshot.

---

## How to Opt-Out

If you need a specific procedure to **NOT use transactions**:

### Method 1: Don't Apply Middleware

```typescript
@Router({ alias: 'crud' })
export class CrudRouter {
  // ✅ Transactional
  @UseMiddlewares(TransactionMiddleware, AuthMiddleware)
  @Mutation()
  async create() { /* ... */ }

  // ❌ Not transactional (no TransactionMiddleware)
  @UseMiddlewares(AuthMiddleware)
  @Mutation()
  async updateLargeFile() {
    // Long-running operation, don't hold transaction open
  }
}
```

### Method 2: Use Propagation.NOT_SUPPORTED

```typescript
@Injectable()
export class FileService {
  // This runs OUTSIDE any parent transaction
  @Transactional({ propagation: Propagation.NOT_SUPPORTED })
  async uploadLargeFile(file: Buffer): Promise<void> {
    // External service call - don't need transaction
    await s3.upload(file);
  }
}
```

---

## Testing Default Transactions

### Test 1: Verify Rollback Works

```typescript
// crud.service.ts
async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
  const created = await this.crudRepository.create(data);

  throw new Error('Test rollback');  // ← Simulate error

  return created;
}
```

**Expected:**
- Error thrown ✅
- Database has NO new record ✅ (rolled back)

### Test 2: Verify Normal Operation

```typescript
// Remove the error
async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
  return this.crudRepository.create(data);
}
```

**Expected:**
- Record created ✅
- Database has new record ✅

---

## Performance Considerations

### Transaction Overhead

Each transaction has a small overhead (~1-5ms). For read-heavy apps, consider:

1. **Skip transactions for Queries** (if using mutation-only approach)
2. **Connection pool sizing** - ensure `connection_limit` is adequate
3. **Transaction timeout** - keep short (5-10 seconds max)

### Recommended Settings

```typescript
// In TransactionMiddleware
@Transactional({
  timeout: 10000,         // 10 seconds max
  isolationLevel: 'ReadCommitted',  // Default (fastest)
})
async use(opts: MiddlewareOptions) {
  return opts.next();
}
```

---

## Migration Guide

### Before (Manual Decorators)

```typescript
@Injectable()
export class UserService {
  @Transactional()  // ← Remove this
  async register(data: RegisterDto) {
    const user = await this.userRepo.create(data.user);
    const profile = await this.profileRepo.create(data.profile);
    return { user, profile };
  }

  @Transactional()  // ← Remove this
  async update(id: string, data: UpdateDto) {
    return this.userRepo.update(id, data);
  }
}
```

### After (Router Middleware)

```typescript
// 1. Add middleware to router
@UseMiddlewares(TransactionMiddleware)
@Router({ alias: 'user' })
export class UserRouter {
  // All mutations automatically transactional
}

// 2. Remove decorators from service
@Injectable()
export class UserService {
  // ✅ Automatic transaction (no decorator needed)
  async register(data: RegisterDto) {
    const user = await this.userRepo.create(data.user);
    const profile = await this.profileRepo.create(data.profile);
    return { user, profile };
  }

  // ✅ Automatic transaction
  async update(id: string, data: UpdateDto) {
    return this.userRepo.update(id, data);
  }
}
```

---

## Summary

### What You Get

✅ **All mutations are transactional by default**
✅ **No need to add `@Transactional()` to services**
✅ **Automatic rollback on errors**
✅ **Clean, maintainable code**
✅ **Easy to opt-out when needed**

### What to Remember

1. Apply `@UseMiddlewares(TransactionMiddleware)` at **Router level**
2. Register `TransactionMiddleware` in **module providers**
3. Remove `@Transactional()` from **service methods**
4. Use `Propagation.NOT_SUPPORTED` to **opt-out** specific methods

---

**Last Updated:** 2025-12-08
