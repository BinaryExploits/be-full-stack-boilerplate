# @repo/db-seeder

Shared database seeding infrastructure for all database types (Prisma, Mongoose, etc.)

## Features

- 🔄 **Database Agnostic** - Works with Prisma, Mongoose, or any ORM
- 📦 **Zero Code Duplication** - Write seeding logic once, use everywhere
- 🚀 **Easy to Use** - Simple orchestrator handles all complexity
- ✅ **Validation First** - Validates all data before any DB operations

## Installation

This package is already available in the monorepo workspace:

```typescript
import { BaseSeeder, runSeeders, SeedLogger } from "@repo/db-seeder";
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   @repo/db-seeder                   │
│                 (Shared Infrastructure)              │
├─────────────────────────────────────────────────────┤
│  • SeedLogger (colored, consistent logging)         │
│  • BaseSeeder (database-agnostic base class)        │
│  • SeederOrchestrator (handles lifecycle)           │
└─────────────────────────────────────────────────────┘
                    ▲               ▲
                    │               │
        ┌───────────┴───┐       ┌───┴──────────┐
        │   Prisma      │       │   Mongoose   │
        │   Seeders     │       │   Seeders    │
        └───────────────┘       └──────────────┘
```

## Quick Start

### 1. Create a Seeder Class

```typescript
import { BaseSeeder } from '@repo/db-seeder';
import { PrismaClient, User } from '@prisma/client';

export class UserSeeder extends BaseSeeder<Partial<User>> {
  readonly entityName = 'USER';
  readonly seedFile = 'users.json';

  constructor(private readonly prisma: PrismaClient) {
    super(path.join(__dirname, '..', 'seed-data'));
  }

  validate(): string[] {
    const errors: string[] = [];

    for (let i = 0; i < this.records.length; i++) {
      const user = this.records[i];
      if (!user.email) {
        errors.push(\`User at index \${i}: email is required\`);
      }
    }

    if (errors.length === 0) {
      this.logger.success(\`✓ Validated \${this.records.length} record(s)\`, this.entityName);
    }

    return errors;
  }

  async clean(): Promise<void> {
    const result = await this.prisma.user.deleteMany();
    this.logger.success(\`✓ Cleaned \${result.count} record(s)\`, this.entityName);
  }

  async seed(): Promise<void> {
    for (const record of this.records) {
      await this.prisma.user.create({ data: record });
    }
    this.logger.success(\`✓ Seeded \${this.records.length} record(s)\`, this.entityName);
  }
}
```

### 2. Create Seed Data JSON

Create `seed-data/users.json`:

```json
[
  {
    "email": "user1@example.com",
    "name": "User One"
  },
  {
    "email": "user2@example.com",
    "name": "User Two"
  }
]
```

### 3. Create Seed Script

```typescript
import { PrismaClient } from "@prisma/client";
import { runSeeders } from "@repo/db-seeder";
import { UserSeeder } from "./seeders/user.seeder";
import { PostSeeder } from "./seeders/post.seeder";

const prisma = new PrismaClient();

runSeeders({
  seeders: [new UserSeeder(prisma), new PostSeeder(prisma)],
  loggerPrefix: "[SEED_PRISMA]",
  onDisconnect: async () => {
    await prisma.$disconnect();
  },
})
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

## Color Scheme

All logs follow a consistent color scheme:

| Element           | Color   | Example               |
| ----------------- | ------- | --------------------- |
| Prefix `[SEED_*]` | Cyan    | `[SEED_PRISMA]`       |
| Entity Context    | Magenta | `[USER]`              |
| Step Context      | Yellow  | `[Step 1]`            |
| Success Messages  | Green   | `✓ Seeded 5 records`  |
| Error Messages    | Red     | `✗ Validation failed` |
| Info Messages     | Blue    | General information   |
| Separators        | Gray    | Visual dividers       |

## API Reference

### `runSeeders(config)`

Main function to run the seeding process.

**Parameters:**

- `seeders`: Array of seeder instances
- `loggerPrefix`: Custom prefix for logs (e.g., `"[SEED_PRISMA]"`)
- `onConnect`: Optional callback to connect to database
- `onDisconnect`: Optional callback to disconnect from database

**Example:**

```typescript
await runSeeders({
  seeders: [new UserSeeder(prisma)],
  loggerPrefix: "[SEED_PRISMA]",
  onConnect: async () => {
    await database.connect();
  },
  onDisconnect: async () => {
    await database.disconnect();
  },
});
```

### `BaseSeeder<T>`

Abstract base class for all seeders.

**Constructor:**

- `seedDataDir`: Path to seed data directory

**Properties:**

- `entityName`: Name of the entity (e.g., "USER", "POST")
- `seedFile`: JSON file name (e.g., "users.json")
- `records`: Loaded records array
- `logger`: SeedLogger instance

**Methods:**

- `loadData()`: Loads data from JSON file (implemented)
- `validate()`: Validate records (must implement)
- `clean()`: Clean database (must implement)
- `seed()`: Seed database (must implement)

### `SeedLogger`

Static logger class with colored output.

**Methods:**

- `log(message, context?)`: Blue info messages
- `success(message, context?)`: Green success messages
- `error(message, context?)`: Red error messages
- `warn(message, context?)`: Yellow warning messages
- `info(message, context?)`: Cyan info messages
- `step(stepNumber, message)`: Numbered step indicators
- `separator()`: Visual separator line
- `setPrefix(prefix)`: Set custom prefix

## Seeding Process Flow

```
1. Load Data     → Load all JSON files
                   ↓
2. Validate      → Validate all data (collects ALL errors)
                   ↓
3. Clean         → Delete existing records
                   ↓
4. Seed          → Insert new records
```

## Example Output

```
────────────────────────────────────────────────────────────
[SEED_PRISMA] Starting database seeding process...
────────────────────────────────────────────────────────────
[SEED_PRISMA] [Step 1] Loading data for all seeders...
[SEED_PRISMA] [USER] Loading data from users.json
[SEED_PRISMA] [USER] ✓ Loaded 10 record(s)
[SEED_PRISMA] [POST] Loading data from posts.json
[SEED_PRISMA] [POST] ✓ Loaded 25 record(s)
[SEED_PRISMA] [Step 2] Validating all seed data...
[SEED_PRISMA] [USER] ✓ Validated 10 record(s)
[SEED_PRISMA] [POST] ✓ Validated 25 record(s)
[SEED_PRISMA] ✓ All validation completed successfully
[SEED_PRISMA] [Step 3] Cleaning database...
[SEED_PRISMA] [USER] ✓ Cleaned 8 record(s)
[SEED_PRISMA] [POST] ✓ Cleaned 20 record(s)
[SEED_PRISMA] [Step 4] Seeding database...
[SEED_PRISMA] [USER] ✓ Seeded 10 record(s)
[SEED_PRISMA] [POST] ✓ Seeded 25 record(s)
────────────────────────────────────────────────────────────
[SEED_PRISMA] ✓ Database seeding completed successfully!
────────────────────────────────────────────────────────────
```

## Adding New Databases

To add support for a new database type:

1. Create a database-specific `BaseSeeder` wrapper
2. Implement database-specific `validate()`, `clean()`, and `seed()` methods
3. Use `runSeeders()` with appropriate connection callbacks

Example for TypeORM:

```typescript
import { BaseSeeder as SharedBaseSeeder } from "@repo/db-seeder";
import { Repository } from "typeorm";

export abstract class TypeORMSeeder<T> extends SharedBaseSeeder<T> {
  abstract readonly repository: Repository<T>;

  constructor() {
    super(path.join(__dirname, "..", "seed-data"));
  }

  async clean(): Promise<void> {
    await this.repository.clear();
  }

  async seed(): Promise<void> {
    await this.repository.save(this.records);
  }
}
```
