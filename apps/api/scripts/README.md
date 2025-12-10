# API Scripts

## Repository Generators

### Prisma Repository Generator

Generates type-safe Prisma repositories.

```bash
pnpm run generate:repo:prisma <entityName>
```

Example:
```bash
pnpm run generate:repo:prisma crud
```

Output: `src/modules/{entity}/repositories/prisma/`
- `{entity}.repository.interface.ts`
- `{entity}.repository.abstract.ts`
- `{entity}.repository.ts`

### Mongoose Repository Generator

Generates Mongoose repositories with entity schema.

```bash
pnpm run generate:repo:mongo <entityName>
```

Example:
```bash
pnpm run generate:repo:mongo crud
```

Output: `src/modules/{entity}/repositories/mongoose/`
- `entities/{entity}.entity.ts` - Empty entity class (add @Prop decorators)
- `{entity}.mongo.repository.ts` - Repository implementation

Note:
1. Add properties to the entity class using @Prop decorators
2. Implement the `toDomainEntity` method in the repository
