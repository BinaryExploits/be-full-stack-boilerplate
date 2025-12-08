# Database-Agnostic Transaction Management Guide

## Overview

This guide explains how to implement **declarative, database-agnostic transaction management** in this NestJS codebase. The solution allows you to automatically wrap entire request handlers in transactions using a simple decorator pattern, ensuring all database operations commit together or roll back on error—without manually writing transaction logic.

## Table of Contents

1. [Current State](#current-state)
2. [Solution Architecture](#solution-architecture)
3. [Implementation Steps](#implementation-steps)
4. [Usage Examples](#usage-examples)
5. [Advanced Patterns](#advanced-patterns)
6. [Testing Transactions](#testing-transactions)
7. [Troubleshooting](#troubleshooting)

---

## Current State

### Current Architecture

```
Controller → Service A → Repository A → Database (auto-commit)
          → Service B → Repository B → Database (auto-commit)
          → Service C → Repository C → Database (auto-commit)
```

**Problem:** Each database operation commits immediately. If Service C fails, Services A & B already committed, leaving the database in an inconsistent state.

### Current Code Example

```typescript
// apps/api/src/modules/crud/crud.service.ts
async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
  return this.crudRepository.create(data);  // ✅ Commits immediately
}

// If you call multiple services, there's no transaction:
async complexOperation(data: ComplexDto) {
  await this.userService.create(data.user);      // ✅ Commits
  await this.profileService.create(data.profile); // ❌ Fails - user already saved!
}
```

---

## Solution Architecture

### Desired Architecture

```
Controller (with @Transactional)
    ↓
Transaction Interceptor (starts transaction)
    ↓
Service A → Service B → Service C (all use same transaction)
    ↓
Transaction Interceptor (commits or rolls back)
```

### Technology Stack

We'll use **`nestjs-cls`** (Continuation Local Storage) which provides:

- ✅ **Database-agnostic** transaction management
- ✅ **Declarative** `@Transactional()` decorator
- ✅ **Automatic** commit/rollback
- ✅ **Context propagation** across service boundaries
- ✅ **Transaction isolation levels** (Prisma only)
- ✅ **Nested transaction** support with propagation strategies

**Supported Adapters:**
- `@nestjs-cls/transactional-adapter-prisma` - For PostgreSQL (via Prisma)
- `@nestjs-cls/transactional-adapter-mongoose` - For MongoDB (via Mongoose)

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
pnpm add nestjs-cls @nestjs-cls/transactional @nestjs-cls/transactional-adapter-prisma

# If using Mongoose transactions (requires replica set):
# pnpm add @nestjs-cls/transactional-adapter-mongoose
```

### Step 2: Configure ClsModule in AppModule

Update `apps/api/src/app.module.ts`:

```typescript
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './modules/prisma/prisma.service';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Add ClsModule with Transactional Plugin
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,  // Mount CLS middleware globally
        generateId: true,  // Generate request ID
        idGenerator: (req: Request) => req.headers['x-request-id'] ?? crypto.randomUUID(),
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
          enableTransactionProxy: true,  // Allows direct service injection
        }),
      ],
    }),

    // ... rest of your imports
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      context: AppContext,
      errorFormatter: trpcErrorFormatter,
    }),
    PrismaModule,
    MongooseModule.forRoot(process.env.DATABASE_URL_MONGODB!),
    AuthModule,
    // ... other modules
  ],
  controllers: [],
  providers: [AppContext],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

### Step 3: Update PrismaService (Optional Enhancement)

Update `apps/api/src/modules/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/prisma-db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Add logging for debugging transactions
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
      // Global transaction defaults
      transactionOptions: {
        maxWait: 5000,    // 5 seconds
        timeout: 10000,   // 10 seconds
      },
    });

    // Optional: Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Step 4: (Optional) Configure Mongoose for Transactions

**Important:** MongoDB transactions require a **replica set**. For local development:

```bash
# Update docker-compose.mongo.yml to use replica set
# See MongoDB replica set configuration below
```

Add to `apps/api/src/app.module.ts`:

```typescript
import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

// In ClsModule plugins array, add:
plugins: [
  // Prisma adapter (primary)
  new ClsPluginTransactional({
    imports: [PrismaModule],
    adapter: new TransactionalAdapterPrisma({
      prismaInjectionToken: PrismaService,
    }),
  }),
  // Mongoose adapter (secondary - if using MongoDB transactions)
  new ClsPluginTransactional({
    imports: [MongooseModule],
    adapter: new TransactionalAdapterMongoose({
      mongooseConnectionToken: getConnectionToken(),
    }),
  }),
],
```

---

## Usage Examples

### Example 1: Simple Transactional Service Method

```typescript
// apps/api/src/modules/crud/crud.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { CrudRepository } from './repositories/crud.repository';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  // Simple operation - no transaction needed
  async findAll(): Promise<CrudEntity[]> {
    return this.crudRepository.find();
  }

  // Complex operation - wrap in transaction
  @Transactional()
  async createWithRelations(data: ComplexCrudDto): Promise<CrudEntity> {
    // All these operations use the SAME transaction
    const crud = await this.crudRepository.create(data.crud);

    // If this fails, crud.create will be rolled back automatically
    const relation = await this.relationRepository.create({
      crudId: crud.id,
      ...data.relation,
    });

    // If this fails, both operations above roll back
    await this.auditRepository.log({
      action: 'CRUD_CREATED',
      entityId: crud.id,
    });

    return crud;
  }
}
```

**What happens:**
1. `@Transactional()` starts a transaction before the method executes
2. All repository calls use the same transaction context
3. If any operation throws an error, entire transaction rolls back
4. If all succeed, transaction commits automatically

### Example 2: Cross-Service Transaction

```typescript
// apps/api/src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ProfileService } from '../profile/profile.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileService: ProfileService,
    private readonly emailService: EmailService,
  ) {}

  @Transactional()
  async registerUser(data: RegisterDto): Promise<User> {
    // Step 1: Create user
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
    });

    // Step 2: Create profile (different service, same transaction!)
    const profile = await this.profileService.create({
      userId: user.id,
      bio: data.bio,
      avatar: data.avatar,
    });

    // Step 3: Send welcome email (non-transactional, runs outside transaction)
    // Use @Transactional({ propagation: Propagation.NOT_SUPPORTED })
    // on emailService.sendWelcome() if it should run outside transaction
    await this.emailService.sendWelcome(user.email);

    // If email fails, user & profile still roll back
    // If you don't want email to affect transaction, handle separately

    return user;
  }
}
```

### Example 3: Controller-Level Transaction (tRPC Router)

```typescript
// apps/api/src/modules/crud/crud.router.ts
import { Injectable } from '@nestjs/common';
import { Mutation, Router, UseMiddlewares, Input } from 'nestjs-trpc';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthMiddleware } from '../auth/auth.middleware';
import { CrudService } from './crud.service';

@Injectable()
@Router()
export class CrudRouter {
  constructor(private readonly crudService: CrudService) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZComplexCrudRequest,
    output: ZComplexCrudResponse,
  })
  @Transactional()  // Transaction starts here, covers entire request
  async createComplexCrud(
    @Input() req: ComplexCrudRequest,
  ): Promise<ComplexCrudResponse> {
    // Everything in this handler is transactional
    const crud = await this.crudService.createCrud(req.crud);
    const metadata = await this.crudService.createMetadata(req.metadata);
    const tags = await this.crudService.addTags(crud.id, req.tags);

    // If ANY of these fail, ALL roll back
    return {
      success: true,
      crud,
      metadata,
      tags,
    };
  }
}
```

### Example 4: Transaction with Isolation Level

```typescript
@Transactional({
  isolationLevel: 'Serializable',  // Strictest isolation
})
async transferBalance(fromId: string, toId: string, amount: number) {
  const fromUser = await this.userRepository.findOne(fromId);
  const toUser = await this.userRepository.findOne(toId);

  if (fromUser.balance < amount) {
    throw new BadRequestException('Insufficient balance');
  }

  // Deduct from sender
  await this.userRepository.update(fromId, {
    balance: fromUser.balance - amount,
  });

  // Add to receiver
  await this.userRepository.update(toId, {
    balance: toUser.balance + amount,
  });
}
```

**Available Isolation Levels:**
- `ReadUncommitted` - Lowest isolation (fast, dirty reads possible)
- `ReadCommitted` - Default (good balance)
- `RepeatableRead` - Prevents non-repeatable reads
- `Serializable` - Highest isolation (slowest, prevents all anomalies)

### Example 5: Manual Transaction Control (Advanced)

```typescript
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient } from '@repo/prisma-db';

@Injectable()
export class AdvancedService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async manualTransaction() {
    // Get the current transaction or regular client
    const tx = this.txHost.tx as PrismaClient;

    // Use it directly
    const user = await tx.user.create({ data: {...} });
    const profile = await tx.profile.create({ data: {...} });

    return { user, profile };
  }
}
```

---

## Advanced Patterns

### Transaction Propagation

Control how nested `@Transactional()` methods behave:

```typescript
import { Propagation } from '@nestjs-cls/transactional';

@Injectable()
export class OrderService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
  ) {}

  @Transactional()
  async createOrder(data: OrderDto) {
    const order = await this.orderRepository.create(data);

    // Uses parent transaction (default)
    await this.inventoryService.reserveItems(order.items);

    // Runs in separate transaction (independent)
    await this.paymentService.processPayment(order.total);

    return order;
  }
}

@Injectable()
export class PaymentService {
  // This runs in its OWN transaction, separate from parent
  @Transactional({ propagation: Propagation.REQUIRES_NEW })
  async processPayment(amount: number) {
    // Even if parent transaction rolls back, this commits independently
    return this.paymentRepository.create({ amount });
  }
}
```

**Propagation Options:**

| Value | Behavior |
|-------|----------|
| `REQUIRED` (default) | Use parent transaction, or create new if none exists |
| `REQUIRES_NEW` | Always create new transaction, suspend parent |
| `SUPPORTS` | Use parent transaction if exists, otherwise run without transaction |
| `NOT_SUPPORTED` | Run without transaction, suspend parent if exists |
| `MANDATORY` | Require parent transaction, throw error if none exists |
| `NEVER` | Run without transaction, throw error if parent exists |

### Conditional Transactions

```typescript
async conditionalCreate(data: CreateDto, useTransaction = true) {
  if (useTransaction) {
    return this.createWithTransaction(data);
  }
  return this.createWithoutTransaction(data);
}

@Transactional()
private async createWithTransaction(data: CreateDto) {
  // Transactional logic
}

private async createWithoutTransaction(data: CreateDto) {
  // Non-transactional logic
}
```

### Transaction Timeout

```typescript
@Transactional({
  timeout: 5000,  // 5 seconds max
})
async longRunningOperation() {
  // If this takes more than 5s, transaction rolls back with timeout error
}
```

### Read-Only Transactions (Optimization)

```typescript
// PostgreSQL-specific optimization
@Transactional({
  isolationLevel: 'ReadCommitted',
  // Add custom options via PrismaClient config
})
async generateReport() {
  // Multiple reads, no writes
  // PostgreSQL can optimize read-only transactions
}
```

---

## Testing Transactions

### Unit Tests

```typescript
// crud.service.spec.ts
import { Test } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';

describe('CrudService', () => {
  let service: CrudService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [PrismaModule],
              adapter: new TransactionalAdapterPrisma({
                prismaInjectionToken: PrismaService,
              }),
            }),
          ],
        }),
        PrismaModule,
      ],
      providers: [CrudService, CrudRepository],
    }).compile();

    service = module.get(CrudService);
    prisma = module.get(PrismaService);
  });

  it('should rollback on error', async () => {
    const spy = jest.spyOn(prisma.crud, 'create');

    await expect(
      service.createWithInvalidData(invalidData)
    ).rejects.toThrow();

    // Verify transaction was rolled back
    const count = await prisma.crud.count();
    expect(count).toBe(0);
  });
});
```

### Integration Tests with Transaction Rollback

```typescript
// Automatically rollback after each test
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Run test inside transaction
    // After test, transaction automatically rolls back
  });
});
```

---

## Troubleshooting

### Issue 1: "No transaction found in context"

**Cause:** CLS middleware not mounted or service called outside request context.

**Solution:**
```typescript
// Ensure ClsModule middleware is mounted
ClsModule.forRoot({
  middleware: { mount: true },  // ← Must be true
  plugins: [...]
})
```

### Issue 2: MongoDB transactions fail

**Cause:** MongoDB requires replica set for transactions.

**Solution:** Update `docker-compose.mongo.yml`:

```yaml
services:
  mongodb:
    image: mongo:latest
    command: ["--replSet", "rs0", "--bind_ip_all"]
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    healthcheck:
      test: |
        mongosh --eval "
          try {
            rs.status();
          } catch(e) {
            rs.initiate({
              _id: 'rs0',
              members: [{ _id: 0, host: 'localhost:27017' }]
            });
          }
        "
      interval: 10s
      timeout: 5s
      retries: 5
```

### Issue 3: Better Auth creating separate PrismaClient

**Problem:** `apps/api/src/modules/auth/auth.ts` creates separate `new PrismaClient()` instead of using injected `PrismaService`.

**Solution:** Refactor Better Auth to accept PrismaService:

```typescript
// auth.module.ts
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [EmailModule, PrismaModule],
      inject: [EmailService, BetterAuthLogger, PrismaService],
      useFactory: (
        emailService: EmailService,
        logger: BetterAuthLogger,
        prisma: PrismaService,  // ← Inject PrismaService
      ) => ({
        auth: createBetterAuth(emailService, logger, prisma),
      }),
    }),
  ],
})
export class AuthModule {}

// auth.ts
export const createBetterAuth = (
  emailService: EmailService,
  logger: BetterAuthLogger,
  prisma: PrismaService,  // ← Accept as parameter
) => {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    // ... rest of config
  });
};
```

### Issue 4: Transaction timeout

**Cause:** Long-running operations exceed default 5-second timeout.

**Solution:**
```typescript
@Transactional({
  timeout: 30000,  // 30 seconds
})
async importLargeDataset(data: any[]) {
  // Long operation
}
```

### Issue 5: Nested transactions not working

**Cause:** Using `Propagation.REQUIRES_NEW` without proper adapter support.

**Solution:** Ensure adapter supports nested transactions:
- ✅ Prisma: Supports `REQUIRES_NEW` with separate `$transaction()` calls
- ⚠️ Mongoose: Limited nested transaction support

---

## Performance Considerations

### 1. Connection Pool Sizing

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10"
```

**Rule of thumb:** `connection_limit = (num_cpus * 2) + effective_spindle_count`

For most apps: **10-20 connections**

### 2. Transaction Duration

**Best practices:**
- ✅ Keep transactions SHORT (< 1 second ideal)
- ✅ Fetch data BEFORE transaction
- ✅ Perform external API calls OUTSIDE transactions
- ❌ Don't do heavy computation inside transactions
- ❌ Don't call external services inside transactions

**Example:**
```typescript
@Transactional()
async createOrder(data: OrderDto) {
  // ❌ BAD: External API call inside transaction
  const paymentResult = await stripe.charges.create(...);
  await this.orderRepository.create({ ...data, paymentId: paymentResult.id });
}

// ✅ GOOD: External call outside transaction
async createOrder(data: OrderDto) {
  const paymentResult = await stripe.charges.create(...);

  return this.saveOrder(data, paymentResult.id);
}

@Transactional()
private async saveOrder(data: OrderDto, paymentId: string) {
  return this.orderRepository.create({ ...data, paymentId });
}
```

### 3. Isolation Level Tradeoffs

| Level | Performance | Safety | Use Case |
|-------|-------------|--------|----------|
| Read Uncommitted | ⚡⚡⚡ Fastest | ⚠️ Lowest | Analytics, approximations |
| Read Committed | ⚡⚡ Fast | ✅ Good | General use (default) |
| Repeatable Read | ⚡ Medium | ✅✅ Better | Financial operations |
| Serializable | 🐌 Slowest | ✅✅✅ Best | Critical operations |

---

## Migration Strategy

### Phase 1: Identify Critical Operations

Audit your codebase for operations that need transactions:

```bash
# Find multi-step operations
grep -r "await.*Repository\." apps/api/src --include="*.service.ts" | grep -A 5 -B 5 "async"
```

**Candidates for transactions:**
- User registration (user + profile + verification)
- Order creation (order + items + inventory update)
- Payment processing (payment + order status + invoice)
- Data imports (multiple creates)

### Phase 2: Gradual Rollout

1. **Week 1:** Install dependencies, configure ClsModule
2. **Week 2:** Add `@Transactional()` to 1-2 critical endpoints
3. **Week 3:** Monitor logs, adjust timeouts if needed
4. **Week 4:** Expand to all multi-step operations

### Phase 3: Validation

```typescript
// Add logging to verify transactions work
@Transactional()
async createUser(data: CreateUserDto) {
  console.log('Transaction started');
  try {
    const user = await this.userRepository.create(data);
    console.log('User created:', user.id);

    const profile = await this.profileRepository.create({...});
    console.log('Profile created:', profile.id);

    console.log('Transaction will commit');
    return user;
  } catch (error) {
    console.log('Transaction will rollback');
    throw error;
  }
}
```

---

## Summary

### Benefits of This Approach

✅ **Declarative:** Just add `@Transactional()`, no boilerplate
✅ **Database-agnostic:** Works with Prisma, Mongoose, TypeORM
✅ **Automatic:** Commit/rollback handled for you
✅ **Context-aware:** Transaction propagates across services
✅ **Configurable:** Timeouts, isolation levels, propagation strategies
✅ **Testable:** Easy to mock and test

### When to Use Transactions

| Scenario | Use Transaction? |
|----------|------------------|
| Single read operation | ❌ No |
| Single create/update/delete | ❌ No (usually) |
| Multiple related writes | ✅ Yes |
| Cross-service operations | ✅ Yes |
| Financial operations | ✅ Yes |
| Data imports | ✅ Yes |
| Read-only operations | ❌ No (unless you need consistent snapshot) |

### Next Steps

1. **Install packages** (see Step 1)
2. **Configure ClsModule** in `app.module.ts` (see Step 2)
3. **Add `@Transactional()` to complex operations** (see Usage Examples)
4. **Test rollback behavior** (see Testing section)
5. **Monitor performance** and adjust timeouts

---

## End-to-End Transaction Examples

This section provides **complete, production-ready examples** showing the entire flow from tRPC router to repository with transactions, based on this codebase's architecture.

### Example 1: Simple CRUD with Transaction (Single Service)

This example shows how to add transactions to the existing CRUD module.

#### Step 1: Update Repository (No changes needed)

```typescript
// apps/api/src/modules/crud/repositories/crud.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrudRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCrudDto): Promise<CrudEntity> {
    // This automatically uses the transaction from CLS context if available
    return this.prisma.crud.create({ data });
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    return this.prisma.crud.update({ where: { id }, data });
  }

  async delete(id: string): Promise<CrudEntity | null> {
    return this.prisma.crud.delete({ where: { id } });
  }
}
```

**Key Point:** Repository code doesn't change! `PrismaService` automatically uses transaction context when available.

#### Step 2: Add @Transactional to Service (Optional)

```typescript
// apps/api/src/modules/crud/crud.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { CrudRepository } from './repositories/crud.repository';

@Injectable()
export class CrudService {
  constructor(private readonly crudRepository: CrudRepository) {}

  // Simple operation - no transaction decorator needed
  async createCrud(data: CreateCrudDto): Promise<CrudEntity> {
    return this.crudRepository.create(data);
  }

  // Complex operation - add @Transactional
  @Transactional()
  async createCrudWithAudit(data: CreateCrudDto, userId: string): Promise<CrudEntity> {
    // Step 1: Create the CRUD item
    const crud = await this.crudRepository.create(data);

    // Step 2: Log audit trail (same transaction)
    await this.auditRepository.log({
      action: 'CREATE',
      entityType: 'CRUD',
      entityId: crud.id,
      userId,
      timestamp: new Date(),
    });

    // If audit log fails, crud creation is also rolled back
    return crud;
  }
}
```

#### Step 3: Add @Transactional to tRPC Router

```typescript
// apps/api/src/modules/crud/crud.router.ts
import { Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { Transactional } from '@nestjs-cls/transactional';
import { CrudService } from './crud.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import * as CrudSchema from './schemas/crud.schema';

@Router({ alias: 'crud' })
export class CrudRouter {
  constructor(private readonly crudService: CrudService) {}

  // Option A: Transaction at router level (covers entire request)
  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudCreateRequest,
    output: ZCrudCreateResponse,
  })
  @Transactional()  // ← Add this decorator
  async createCrud(
    @Input() req: CrudSchema.TCrudCreateRequest,
  ): Promise<CrudSchema.TCrudCreateResponse> {
    const created = await this.crudService.createCrud(req);
    return {
      success: created != null,
      id: created?.id,
      message: created ? 'Item created successfully' : 'Failed to create item',
    };
  }

  // Option B: Let service handle transaction (if service has @Transactional)
  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCrudUpdateRequest,
    output: ZCrudUpdateResponse,
  })
  async updateCrud(
    @Input() req: CrudSchema.TCrudUpdateRequest,
  ): Promise<CrudSchema.TCrudUpdateResponse> {
    // No @Transactional here, service method handles it
    const updated = await this.crudService.update(req.id, req.data);
    return {
      success: updated != null,
      data: updated ?? undefined,
      message: updated ? 'Item updated successfully' : 'Failed to update item',
    };
  }
}
```

**Transaction Flow:**
```
Client Request
    ↓
tRPC Router (@Transactional)
    ↓
[Transaction Starts] ← ClsModule intercepts
    ↓
CrudService.createCrud()
    ↓
CrudRepository.create() ← Uses transaction from CLS context
    ↓
PrismaService.crud.create() ← Executes in transaction
    ↓
[Transaction Commits] ← Automatic on success
    ↓
Response to Client
```

---

### Example 2: Multi-Service Transaction (User Registration)

This example shows a complete user registration flow with profile creation across multiple services.

#### Step 1: Create Schema/DTOs

```typescript
// apps/api/src/modules/user/schemas/user.schema.ts
import { z } from 'zod';

export const ZRegisterUserRequest = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  profile: z.object({
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
    phone: z.string().optional(),
  }),
});

export type TRegisterUserRequest = z.infer<typeof ZRegisterUserRequest>;

export const ZRegisterUserResponse = z.object({
  success: z.boolean(),
  userId: z.string().optional(),
  message: z.string(),
});

export type TRegisterUserResponse = z.infer<typeof ZRegisterUserResponse>;
```

#### Step 2: Create Repositories

```typescript
// apps/api/src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        // Note: In real app, hash password before storing
        password: data.password,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}

// apps/api/src/modules/profile/repositories/profile.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProfileDto): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        userId: data.userId,
        bio: data.bio,
        avatar: data.avatar,
        phone: data.phone,
      },
    });
  }
}
```

#### Step 3: Create Services

```typescript
// apps/api/src/modules/user/user.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { UserRepository } from './repositories/user.repository';
import { ProfileService } from '../profile/profile.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileService: ProfileService,
  ) {}

  // This method orchestrates the entire registration with transaction
  @Transactional()
  async registerUser(data: RegisterUserDto): Promise<User> {
    // Step 1: Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Step 2: Hash password (outside DB operation, but inside transaction scope)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Step 3: Create user
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    // Step 4: Create profile (different service, same transaction!)
    await this.profileService.create({
      userId: user.id,
      bio: data.profile.bio,
      avatar: data.profile.avatar,
      phone: data.profile.phone,
    });

    // If ANY of the above steps fail, EVERYTHING rolls back
    return user;
  }
}

// apps/api/src/modules/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  // No @Transactional needed here - it uses parent transaction
  async create(data: CreateProfileDto): Promise<Profile> {
    return this.profileRepository.create(data);
  }
}
```

#### Step 4: Create tRPC Router

```typescript
// apps/api/src/modules/user/user.router.ts
import { Input, Mutation, Router } from 'nestjs-trpc';
import { Transactional } from '@nestjs-cls/transactional';
import { UserService } from './user.service';
import {
  ZRegisterUserRequest,
  ZRegisterUserResponse,
  TRegisterUserRequest,
  TRegisterUserResponse,
} from './schemas/user.schema';

@Router({ alias: 'user' })
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  @Mutation({
    input: ZRegisterUserRequest,
    output: ZRegisterUserResponse,
  })
  // Option A: Add @Transactional here (router level)
  @Transactional()
  async register(
    @Input() req: TRegisterUserRequest,
  ): Promise<TRegisterUserResponse> {
    try {
      const user = await this.userService.registerUser(req);

      return {
        success: true,
        userId: user.id,
        message: 'User registered successfully',
      };
    } catch (error) {
      // Transaction automatically rolls back on error
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Option B: Let service handle transaction (remove @Transactional from router)
  // If UserService.registerUser has @Transactional, it will handle the transaction
}
```

**Complete Transaction Flow:**
```
Client calls: trpc.user.register.mutate({ email, name, password, profile })
    ↓
UserRouter.register() [@Transactional starts here]
    ↓
[TRANSACTION STARTS] ← CLS context created
    ↓
UserService.registerUser()
    ├─→ UserRepository.findByEmail() ← Read in transaction
    ├─→ bcrypt.hash() ← CPU work (outside DB)
    ├─→ UserRepository.create() ← Write in transaction
    └─→ ProfileService.create()
        └─→ ProfileRepository.create() ← Write in SAME transaction
    ↓
[TRANSACTION COMMITS] ← All succeeded
    ↓
Return success response to client

// If ProfileRepository.create() fails:
    ↓
[TRANSACTION ROLLS BACK] ← User creation also undone
    ↓
Return error response to client
```

---

### Example 3: Complex E-commerce Order Creation

This demonstrates a real-world scenario with multiple related entities and validation.

#### Complete File Structure:

```
apps/api/src/modules/
├── order/
│   ├── order.module.ts
│   ├── order.router.ts       ← tRPC router with @Transactional
│   ├── order.service.ts      ← Business logic
│   ├── repositories/
│   │   ├── order.repository.ts
│   │   └── order-item.repository.ts
│   └── schemas/
│       └── order.schema.ts
├── inventory/
│   ├── inventory.service.ts  ← Called by order service
│   └── repositories/
│       └── inventory.repository.ts
└── notification/
    └── notification.service.ts ← Runs OUTSIDE transaction
```

#### Implementation:

```typescript
// apps/api/src/modules/order/schemas/order.schema.ts
import { z } from 'zod';

export const ZCreateOrderRequest = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().positive(),
    })
  ).min(1),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
});

export type TCreateOrderRequest = z.infer<typeof ZCreateOrderRequest>;

export const ZCreateOrderResponse = z.object({
  success: z.boolean(),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  total: z.number().optional(),
  message: z.string(),
});

export type TCreateOrderResponse = z.infer<typeof ZCreateOrderResponse>;
```

```typescript
// apps/api/src/modules/order/repositories/order.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        orderNumber: data.orderNumber,
        total: data.total,
        status: 'PENDING',
        shippingAddress: data.shippingAddress,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }
}

// apps/api/src/modules/order/repositories/order-item.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(orderId: string, items: CreateOrderItemDto[]): Promise<OrderItem[]> {
    const data = items.map((item) => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await this.prisma.orderItem.createMany({ data });
    return this.prisma.orderItem.findMany({ where: { orderId } });
  }
}
```

```typescript
// apps/api/src/modules/inventory/inventory.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from './repositories/inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  // This runs in parent transaction if called from @Transactional context
  async reserveItems(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const inventory = await this.inventoryRepository.findByProductId(item.productId);

      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}`
        );
      }

      // Deduct inventory
      await this.inventoryRepository.update(item.productId, {
        quantity: inventory.quantity - item.quantity,
      });
    }
  }
}
```

```typescript
// apps/api/src/modules/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { Transactional, Propagation } from '@nestjs-cls/transactional';

@Injectable()
export class NotificationService {
  // This runs OUTSIDE transaction (won't cause rollback if fails)
  @Transactional({ propagation: Propagation.NOT_SUPPORTED })
  async sendOrderConfirmation(orderId: string, email: string): Promise<void> {
    // Send email via external service (Resend, SendGrid, etc.)
    // Even if this fails, order is already committed
    console.log(`Sending order confirmation for ${orderId} to ${email}`);
  }
}
```

```typescript
// apps/api/src/modules/order/order.service.ts
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly inventoryService: InventoryService,
    private readonly notificationService: NotificationService,
  ) {}

  @Transactional()
  async createOrder(data: CreateOrderDto): Promise<Order> {
    // Step 1: Reserve inventory (validates stock availability)
    // If any item is out of stock, this throws and transaction rolls back
    await this.inventoryService.reserveItems(data.items);

    // Step 2: Calculate total
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Step 3: Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Step 4: Create order
    const order = await this.orderRepository.create({
      customerId: data.customerId,
      orderNumber,
      total,
      shippingAddress: JSON.stringify(data.shippingAddress),
    });

    // Step 5: Create order items
    await this.orderItemRepository.createMany(order.id, data.items);

    // Step 6: Send notification (runs outside transaction)
    // This won't cause rollback if it fails
    await this.notificationService.sendOrderConfirmation(
      order.id,
      data.customerEmail
    );

    return order;
  }
}
```

```typescript
// apps/api/src/modules/order/order.router.ts
import { Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { Transactional } from '@nestjs-cls/transactional';
import { OrderService } from './order.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import {
  ZCreateOrderRequest,
  ZCreateOrderResponse,
  TCreateOrderRequest,
  TCreateOrderResponse,
} from './schemas/order.schema';

@Router({ alias: 'order' })
export class OrderRouter {
  constructor(private readonly orderService: OrderService) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: ZCreateOrderRequest,
    output: ZCreateOrderResponse,
  })
  @Transactional({
    timeout: 10000,  // 10 seconds for complex operation
    isolationLevel: 'ReadCommitted',
  })
  async createOrder(
    @Input() req: TCreateOrderRequest,
  ): Promise<TCreateOrderResponse> {
    try {
      const order = await this.orderService.createOrder(req);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        message: 'Order created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }
}
```

**Complete Transaction Flow with Rollback Scenarios:**

```
Client: trpc.order.createOrder.mutate({ customerId, items, shippingAddress })
    ↓
OrderRouter.createOrder() [@Transactional starts]
    ↓
[TRANSACTION STARTS - timeout: 10s, isolation: ReadCommitted]
    ↓
OrderService.createOrder()
    ├─→ InventoryService.reserveItems()
    │   ├─→ Check product 1 stock ← READ in transaction
    │   ├─→ Deduct product 1 stock ← WRITE in transaction
    │   ├─→ Check product 2 stock ← READ in transaction
    │   └─→ Deduct product 2 stock ← WRITE in transaction
    │       └─→ ❌ Out of stock! BadRequestException thrown
    │           ↓
    │       [TRANSACTION ROLLS BACK] ← All inventory changes undone
    │           ↓
    │       Return error: "Insufficient stock for product XYZ"

    // If inventory check passes:
    ├─→ Calculate total (CPU work)
    ├─→ Generate order number (CPU work)
    ├─→ OrderRepository.create() ← WRITE in transaction
    ├─→ OrderItemRepository.createMany() ← WRITE in transaction
    │   └─→ ❌ Database constraint violation (e.g., invalid productId)
    │       ↓
    │   [TRANSACTION ROLLS BACK] ← Order creation AND inventory deductions undone
    │       ↓
    │   Return error: "Failed to create order items"

    // If all DB operations succeed:
    └─→ NotificationService.sendOrderConfirmation() ← OUTSIDE transaction
        └─→ ❌ Email service fails
            ↓
        [TRANSACTION STILL COMMITS] ← Order is saved, email failed separately
            ↓
        Log error, but return success (order created, notification failed)
    ↓
[TRANSACTION COMMITS] ← All succeeded
    ↓
Return: { success: true, orderId: "...", orderNumber: "ORD-...", total: 299.99 }
```

---

### Example 4: Accessing Transaction Directly in Repositories

Sometimes you need direct access to the transaction client (e.g., for raw queries or complex operations).

```typescript
// apps/api/src/modules/analytics/repositories/analytics.repository.ts
import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient } from '@repo/prisma-db';

@Injectable()
export class AnalyticsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async generateReportWithRawSQL(startDate: Date, endDate: Date): Promise<any[]> {
    // Get transaction client or fallback to regular client
    const prisma = (this.txHost.tx ?? this.txHost.prisma) as PrismaClient;

    // Execute raw SQL within transaction context
    return prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
  }
}
```

---

### Example 5: Testing Transactions with Rollback

```typescript
// apps/api/src/modules/order/order.service.spec.ts
import { Test } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from './order.service';

describe('OrderService - Transaction Tests', () => {
  let service: OrderService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true },
          plugins: [
            new ClsPluginTransactional({
              imports: [PrismaModule],
              adapter: new TransactionalAdapterPrisma({
                prismaInjectionToken: PrismaService,
              }),
            }),
          ],
        }),
        PrismaModule,
        OrderModule,
        InventoryModule,
      ],
      providers: [OrderService, /* other providers */],
    }).compile();

    service = module.get(OrderService);
    prisma = module.get(PrismaService);
  });

  it('should rollback entire order when inventory is insufficient', async () => {
    // Setup: Create product with limited stock
    const product = await prisma.product.create({
      data: { name: 'Test Product', price: 100 },
    });
    await prisma.inventory.create({
      data: { productId: product.id, quantity: 5 },
    });

    // Test: Try to order more than available
    await expect(
      service.createOrder({
        customerId: 'test-customer',
        items: [{ productId: product.id, quantity: 10, price: 100 }],
        shippingAddress: { /* ... */ },
      })
    ).rejects.toThrow('Insufficient stock');

    // Verify: No order created
    const orderCount = await prisma.order.count();
    expect(orderCount).toBe(0);

    // Verify: Inventory unchanged
    const inventory = await prisma.inventory.findUnique({
      where: { productId: product.id },
    });
    expect(inventory.quantity).toBe(5); // Still 5, not deducted
  });

  it('should commit order and deduct inventory on success', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test Product', price: 100 },
    });
    await prisma.inventory.create({
      data: { productId: product.id, quantity: 10 },
    });

    const order = await service.createOrder({
      customerId: 'test-customer',
      items: [{ productId: product.id, quantity: 3, price: 100 }],
      shippingAddress: { /* ... */ },
    });

    // Verify: Order created
    expect(order.id).toBeDefined();
    expect(order.total).toBe(300);

    // Verify: Inventory deducted
    const inventory = await prisma.inventory.findUnique({
      where: { productId: product.id },
    });
    expect(inventory.quantity).toBe(7); // 10 - 3 = 7
  });
});
```

---

### Where to Place @Transactional

| Layer | When to Use | Example |
|-------|-------------|---------|
| **tRPC Router** | When you want to wrap the entire request handler | `@Transactional()` on `createOrder()` |
| **Service** | When the service orchestrates multiple operations | `@Transactional()` on `OrderService.createOrder()` |
| **Repository** | ❌ Never | Repositories use transaction from context automatically |

**Best Practice:** Put `@Transactional()` at the **highest level** that needs atomicity:

```typescript
// ✅ GOOD: Transaction at router level (covers entire request)
@Router()
export class OrderRouter {
  @Mutation()
  @Transactional()
  async createOrder() {
    await this.orderService.create();     // Uses transaction
    await this.emailService.sendEmail();  // Uses transaction
  }
}

// ⚠️ OKAY: Transaction at service level (if router doesn't need transaction)
export class OrderService {
  @Transactional()
  async create() {
    await this.orderRepo.create();
    await this.itemRepo.createMany();
  }
}

// ❌ BAD: Multiple transactions (defeats the purpose)
export class OrderService {
  @Transactional()
  async createOrder() { /* ... */ }

  @Transactional()
  async createItems() { /* ... */ }  // Separate transaction!
}
```

---

### Common Pitfalls and Solutions

#### Pitfall 1: External API Calls Inside Transactions

```typescript
// ❌ BAD: Payment API inside transaction
@Transactional()
async createOrder(data: OrderDto) {
  const order = await this.orderRepo.create(data);
  const payment = await stripe.charges.create(...);  // External API!
  await this.orderRepo.update(order.id, { paymentId: payment.id });
}

// ✅ GOOD: External API outside transaction
async createOrder(data: OrderDto) {
  // Step 1: Process payment first (outside transaction)
  const payment = await stripe.charges.create(...);

  // Step 2: Save to DB (inside transaction)
  return this.saveOrder(data, payment.id);
}

@Transactional()
private async saveOrder(data: OrderDto, paymentId: string) {
  return this.orderRepo.create({ ...data, paymentId });
}
```

#### Pitfall 2: Forgetting to Throw Errors

```typescript
// ❌ BAD: Swallowing errors prevents rollback
@Transactional()
async createOrder(data: OrderDto) {
  try {
    await this.inventoryService.reserve(data.items);
  } catch (error) {
    console.log('Inventory failed');  // Transaction won't rollback!
    return null;
  }
}

// ✅ GOOD: Let errors propagate
@Transactional()
async createOrder(data: OrderDto) {
  // Just let it throw - transaction will rollback automatically
  await this.inventoryService.reserve(data.items);
  return this.orderRepo.create(data);
}
```

#### Pitfall 3: Using Wrong Propagation

```typescript
// ❌ BAD: Child service creates separate transaction
export class OrderService {
  @Transactional()
  async createOrder() {
    await this.itemService.createItems();  // Separate transaction!
  }
}

export class ItemService {
  @Transactional({ propagation: Propagation.REQUIRES_NEW })  // Wrong!
  async createItems() { /* ... */ }
}

// ✅ GOOD: Child uses parent transaction (default)
export class ItemService {
  async createItems() {  // No decorator needed
    // Automatically uses parent transaction
  }
}
```

---

## References

- [nestjs-cls Documentation](https://papooch.github.io/nestjs-cls/)
- [Transactional Plugin](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional)
- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)

---

**Created:** 2025-12-08
**Last Updated:** 2025-12-08
**Maintainer:** Binary Exploits LLC
