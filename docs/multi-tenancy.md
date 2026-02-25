# Multi-Tenancy

This boilerplate includes built-in multi-tenancy support with role-based access control, allowing you to build both single-tenant and multi-tenant applications from the same codebase.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Single-Tenant Mode](#single-tenant-mode)
- [Multi-Tenant Mode](#multi-tenant-mode)
- [User Roles](#user-roles)
- [Tenant-Scoped vs Tenant-Less Entities](#tenant-scoped-vs-tenant-less-entities)
- [Setup Guide](#setup-guide)
- [Seeding Tenants](#seeding-tenants)
- [API Reference](#api-reference)

---

## Overview

The multi-tenancy system provides:

- **Flexible deployment**: Run as single-tenant or multi-tenant based on configuration
- **Data isolation**: Tenant-scoped entities ensure data separation
- **Role-based access**: Three distinct user roles (Super Admin, Tenant Admin, Tenant User)
- **Tenant switching**: Users can belong to multiple tenants and switch between them
- **Type-safe APIs**: Full tRPC integration with tenant context

---

## Architecture

### Database Schema

The multi-tenancy system uses three core tables:

1. **Tenant** - Represents an organization or workspace
   - `id`, `slug`, `name`
   - `isDefault` - Flag for default tenant (more on this below)
   - `createdAt`, `updatedAt`

2. **TenantMembership** - Links users to tenants with roles
   - `email`, `tenantId`, `role`
   - Unique constraint on `(email, tenantId)`

3. **UserProfile** - Tracks user's selected tenant
   - `userId`, `selectedTenantId`
   - Stores which tenant the user is currently working in

### Data Flow

1. User authenticates via Better Auth
2. System loads available tenants for the user (via `myTenants` query)
3. User selects a tenant (or is auto-assigned if only one available)
4. Subsequent API calls include tenant context automatically
5. Data queries are automatically scoped to the selected tenant

---

## Single-Tenant Mode

**Single-tenant mode** makes your application behave like a traditional tenant-less app.

### When is Single-Tenant Mode Active?

Single-tenant mode activates when:
- There is **exactly one tenant** in the database
- That tenant has `isDefault: true`

### Behavior in Single-Tenant Mode

- All users automatically get access to the default tenant
- No tenant switcher UI is displayed
- No tenant management interface is shown
- The app behaves as if multi-tenancy doesn't exist
- Perfect for startups or products that don't need multi-tenancy yet

### Use Cases

- Building an MVP that doesn't need multi-tenancy initially
- Internal tools for a single organization
- SaaS products with simple account structures
- Gradual migration from single-tenant to multi-tenant

---

## Multi-Tenant Mode

**Multi-tenant mode** activates when there are multiple tenants or no default tenant exists.

### Features

- Tenant switcher in the navigation bar
- Users can belong to multiple tenants
- Each tenant has its own isolated data
- Tenant admins can manage their tenant members
- Super admins can create/delete tenants

### Tenant Selection Flow

1. User logs in
2. System fetches all tenants the user has access to
3. If user has a previously selected tenant, it's loaded automatically
4. If not, user is redirected to tenant selector
5. User selects a tenant
6. `UserProfile.selectedTenantId` is updated
7. User is redirected to the application

### Switching Tenants

Users can switch tenants at any time via the tenant switcher in the navigation:

```typescript
// Frontend (Web)
const { mutate: switchTenant } = trpc.tenant.switchTenant.useMutation();

switchTenant({ tenantId: 'new-tenant-id' }, {
  onSuccess: () => {
    // Refresh the page or update state
    window.location.reload();
  }
});
```

---

## User Roles

The system defines three user roles with distinct permissions:

### 1. Super Admin

**Definition**: Users whose email appears in the `SUPER_ADMIN_EMAILS` environment variable.

**Permissions**:
- Access to **all tenants** automatically
- Create new tenants
- Delete existing tenants
- View and edit all data across all tenants
- Manage tenant memberships for any tenant

**Setup**:
```bash
# apps/api/.env
SUPER_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Use Cases**:
- Platform administrators
- DevOps and support teams
- Tenant lifecycle management

### 2. Tenant Admin

**Definition**: Users with `TENANT_ADMIN` role in `TenantMembership` for a specific tenant.

**Permissions**:
- Access to their assigned tenant(s)
- Add members to their tenant
- Remove members from their tenant
- Manage member roles within their tenant
- Cannot create or delete tenants

**Use Cases**:
- Organization administrators
- Team leads
- Department heads

### 3. Tenant User

**Definition**: Users with `TENANT_USER` role in `TenantMembership` for a specific tenant.

**Permissions**:
- Access to their assigned tenant(s)
- Read and write data within their tenant
- Cannot manage tenant members
- Cannot access tenant settings

**Use Cases**:
- Regular application users
- Team members
- Employees

---

## Tenant-Scoped vs Tenant-Less Entities

### Tenant-Scoped Entities

Add a `tenantId` field to any Prisma model to make it tenant-scoped:

```prisma
model Crud {
  id        String   @id @default(uuid())
  tenantId  String?  // This makes the entity tenant-scoped
  content   String
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@map("crud")
}
```

**Behavior**:
- Data is automatically scoped to the current tenant
- Users can only see data belonging to their selected tenant
- Queries are filtered by `tenantId` in the repository layer

### Tenant-Less (Global) Entities

Omit the `tenantId` field for entities that should be shared across all tenants:

```prisma
model GlobalCrud {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())

  @@map("global_crud")
}
```

**Behavior**:
- Data is shared across all tenants
- All users can see and modify the same data
- No tenant filtering applied

**Use Cases**:
- System-wide configuration
- Shared reference data (countries, currencies, etc.)
- Global statistics or analytics
- Cross-tenant reporting

---

## Setup Guide

### 1. Environment Configuration

Add the following to `apps/api/.env`:

```bash
# Super admin emails (comma-separated)
SUPER_ADMIN_EMAILS=your-email@example.com

# Better Auth trusted origins (include all tenant domains)
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:*,http://*.localhost:*,https://yourdomain.com,https://*.yourdomain.com
```

### 2. Database Migration

The tenant tables are included in the Prisma schema. Run migrations:

```bash
cd packages/prisma-db
pnpm prisma migrate dev
pnpm prisma generate
```

### 3. Seed Initial Tenants

Edit `packages/prisma-db/seeders/seed-data/tenant.json`:

```json
[
  {
    "slug": "localhost",
    "name": "Localhost"
  },
  {
    "slug": "your-company",
    "name": "Your Company"
  }
]
```

Run the seeder:

```bash
cd packages/prisma-db
pnpm run seed
```

### 4. Verify Setup

1. Start the API: `pnpm dev`
2. Login to the web app
3. Check if you see the tenant switcher (multi-tenant mode) or not (single-tenant mode)

---

## Seeding Tenants

### Seed Data Structure

Tenant seed data is stored in `packages/prisma-db/seeders/seed-data/tenant.json`:

```json
[
  {
    "slug": "unique-slug",
    "name": "Display Name",
    "isDefault": false
  }
]
```

**Fields**:
- `slug` (required): Unique identifier (lowercase, alphanumeric, hyphens only)
- `name` (required): Human-readable tenant name
- `isDefault` (optional): Set to `true` for default tenant (defaults to `false`)

### Default Tenant

The `isDefault` flag has special meaning:

- Default tenants grant **automatic access** to all authenticated users
- If there's only one default tenant, the app runs in **single-tenant mode**
- Multiple default tenants are allowed (all users get access to all of them)

**Common Patterns**:

**Single-Tenant App**:
```json
[
  {
    "slug": "app",
    "name": "My App",
    "isDefault": true
  }
]
```

**Multi-Tenant App (Development)**:
```json
[
  {
    "slug": "localhost",
    "name": "Localhost"
  },
  {
    "slug": "tenant-a",
    "name": "Tenant A"
  },
  {
    "slug": "tenant-b",
    "name": "Tenant B"
  }
]
```

**Multi-Tenant App (Production)**:
```json
[
  {
    "slug": "acme-corp",
    "name": "Acme Corporation"
  },
  {
    "slug": "example-inc",
    "name": "Example Inc"
  }
]
```

### Running the Seeder

The seeder is **idempotent** (safe to run multiple times):

```bash
# Using pnpm
pnpm run db:seed

# Or directly
cd packages/prisma-db
pnpm run seed
```

The seeder will:
- Create new tenants if they don't exist
- Update existing tenants if the slug matches
- Skip tenants that already exist with the same data

---

## API Reference

### Frontend Usage (tRPC)

#### Check if Current User is Super Admin

```typescript
const { data } = trpc.tenant.isSuperAdmin.useQuery();
if (data?.isSuperAdmin) {
  // Show super admin UI
}
```

#### Get User's Tenants

```typescript
const { data } = trpc.tenant.myTenants.useQuery();

console.log(data?.tenants); // List of tenants user belongs to
console.log(data?.selectedTenantId); // Currently selected tenant
console.log(data?.singleTenantMode); // True if in single-tenant mode
```

#### Switch Tenant

```typescript
const { mutate } = trpc.tenant.switchTenant.useMutation();

mutate({ tenantId: 'tenant-id' }, {
  onSuccess: () => {
    router.push('/'); // Redirect after switching
  }
});
```

#### Create Tenant (Super Admin Only)

```typescript
const { mutate } = trpc.tenant.create.useMutation();

mutate({
  slug: 'new-tenant',
  name: 'New Tenant'
}, {
  onSuccess: (newTenant) => {
    console.log('Created:', newTenant);
  }
});
```

#### Add Member to Tenant (Tenant Admin or Super Admin)

```typescript
const { mutate } = trpc.tenant.addMember.useMutation();

mutate({
  email: 'user@example.com',
  tenantId: 'tenant-id',
  role: 'TENANT_USER' // or 'TENANT_ADMIN'
});
```

#### List Tenant Members

```typescript
const { data } = trpc.tenant.listMembers.useQuery({
  tenantId: 'tenant-id'
});

console.log(data?.members);
```

#### Remove Member from Tenant

```typescript
const { mutate } = trpc.tenant.removeMember.useMutation();

mutate({
  email: 'user@example.com',
  tenantId: 'tenant-id'
});
```

---

## Best Practices

### 1. Always Use Tenant-Scoped Entities for User Data

Unless data truly needs to be shared globally, always add `tenantId` to your models:

```prisma
model YourEntity {
  id        String   @id @default(uuid())
  tenantId  String   // Always include for user data
  // ... other fields

  @@index([tenantId])
}
```

### 2. Test Both Single and Multi-Tenant Modes

Ensure your UI adapts correctly:
- Hide tenant switcher in single-tenant mode
- Hide tenant management in single-tenant mode
- Test with 1 default tenant (single-tenant)
- Test with multiple tenants (multi-tenant)

### 3. Protect Tenant Admin Routes

Use guards to ensure only admins can access sensitive operations:

```typescript
// Backend (NestJS + tRPC)
@UseMiddlewares(AuthMiddleware, TenantAdminGuard)
```

### 4. Consider Tenant-Specific Subdomains (Advanced)

For production multi-tenant apps, consider using subdomains:
- `tenant-a.yourdomain.com`
- `tenant-b.yourdomain.com`

This requires additional routing logic but provides better isolation and branding.

---

## Troubleshooting

### "No tenant selected" Error

**Cause**: User doesn't have a `selectedTenantId` set in their profile.

**Solution**: Redirect user to tenant selector page, or automatically select if only one tenant available.

### "You no longer have access to this tenant"

**Cause**: User's membership was removed or tenant was deleted.

**Solution**: The system automatically clears `selectedTenantId`. User needs to select a different tenant.

### Can't See Tenant Switcher

**Cause**: App is in single-tenant mode (one default tenant).

**Solution**: This is expected behavior. Add more tenants or remove `isDefault: true` to enable multi-tenant mode.

### Super Admin Can't Create Tenants

**Cause**: Email not in `SUPER_ADMIN_EMAILS` environment variable.

**Solution**:
1. Check `apps/api/.env` for `SUPER_ADMIN_EMAILS`
2. Ensure your email matches exactly (case-insensitive)
3. Restart the API server after changing env vars

---

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. **Add `tenantId` to existing models**:
   ```prisma
   model YourModel {
     // Add this
     tenantId  String?
     tenant    Tenant? @relation(fields: [tenantId], references: [id])

     @@index([tenantId])
   }
   ```

2. **Create and run migration**:
   ```bash
   cd packages/prisma-db
   pnpm prisma migrate dev --name add-tenant-id
   ```

3. **Backfill existing data** with the default tenant ID:
   ```sql
   UPDATE your_table
   SET tenant_id = (SELECT id FROM tenant WHERE is_default = true LIMIT 1);
   ```

4. **Update queries** to include tenant context

5. **Test thoroughly** before deploying to production

---

## Related Documentation

- [Authentication →](authentication.md)
- [GDPR Compliance →](gdpr-compliance.md)
