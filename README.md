# 🧩 BE Full Stack Boilerplate

A **modern full-stack TypeScript monorepo** using:

- **Next.js** (Web)
- **NestJS** (API)
- **Expo** (Mobile)
- **tRPC** (End-to-end type-safe API calls)
- **PostgreSQL** or **MongoDB** (Database - your choice!)
- **Prisma** or **Mongoose** (ORM/ODM - based on your DB choice)
- **Better Auth** (Authentication with OAuth, Email OTP, Email & Password)
- **Multi-Tenancy** (Built-in tenant isolation with role-based access)
- **Internationalization** (typesafe-i18n with multiple languages)
- **Data Grids** (TanStack Table with advanced features)
- **Charts** (Plotly.js with 12+ chart types)
- **GDPR Compliance** (Consent tracking, audit logs, data export/deletion)
- **SonarQube** (Code quality)
- **Rollbar** (Error tracking)
- **Turborepo** (Build orchestration)

This repository is structured for scalability, developer experience, and seamless cross-platform sharing of logic and types.

---

## ✨ Key Features

### 🏢 Multi-Tenancy
- Built-in tenant isolation with role-based access control
- **Single-tenant mode**: Behaves like a tenant-less app when only one default tenant exists
- **Multi-tenant mode**: Full tenant switching and management UI
- Three user roles: Super Admin, Tenant Admin, Tenant User
- [Learn more →](docs/multi-tenancy.md)

### 🔐 Three Authentication Methods
- **Google OAuth** - Social sign-in with account linking
- **Email OTP** - Passwordless authentication via one-time codes
- **Email & Password** - Traditional authentication with encryption
- OAuth tokens encrypted at rest for security
- [Learn more →](docs/authentication.md)

### 🌍 Internationalization
- Type-safe translations powered by **typesafe-i18n**
- English and Dutch included out of the box
- Easy to add new languages
- Runtime-safe with full TypeScript support
- [Learn more →](docs/internationalization.md)

### 📊 Data Grids & Visualizations
- **TanStack Table v8**: Editable, sortable, filterable tables with bulk operations
- **Plotly.js**: 12+ interactive chart types with WebGL support
- Pre-built components for common data visualization needs
- [Data Grids →](docs/data-grids.md) | [Charts →](docs/charts-visualizations.md)

### 🔒 GDPR Compliance
- Automatic consent tracking with IP and timestamp
- Complete audit log for data subject actions
- Data export (download my data as JSON)
- Account deletion with permanent data removal
- [Learn more →](docs/gdpr-compliance.md)

### 🚀 Deployment (AWS EC2)
- Copy a single bootstrap script (`bootstrap/go.sh`) to EC2; it installs git, clones the repo, and runs in-repo deploy scripts.
- Route 53 A record for `<repo-name>.binaryexperiments.com` (zone set in `go.sh`); support for deploying a branch (e.g. for testing before merge).
- [Deployment guide →](docs/deployment.md)

---

## ⚙️ Prerequisites

Make sure the following are installed **before** setup:

| Tool                                                                    | Description                      | Version         |
| ----------------------------------------------------------------------- | -------------------------------- | --------------- |
| [Git](https://git-scm.com/)                                             | Source control                   | Latest          |
| [Node.js](https://nodejs.org/)                                          | Runtime                          | >= **v18**      |
| [pnpm](https://pnpm.io/)                                                | Fast package manager             | `npm i -g pnpm` |
| [Docker](https://www.docker.com/)                                       | For database container           | Latest          |
| [Java + Android SDK (for mobile)](https://developer.android.com/studio) | Required to run Expo Android app | Optional        |

---

## 🏗️ Setup Guide

### 0. Prerequisites

Before proceeding with the setup, ensure you have all the required prerequisites installed.
Missing any of these may cause the setup to fail or not work as expected.

### 1. Clone the Repository and Set Up Environment Variables

```bash
git clone https://github.com/BinaryExploits/be-full-stack-boilerplate.git
cd be-full-stack-boilerplate
```

After cloning the repository, request the required environment files from the code owner. You can also copy **.env.example**, rename it to **.env**, and update it with the required secrets.

Once this is completed, run the automated setup script from the project root to install dependencies and prepare the project:

```bash
npm run setup
```

or

```bash
node setup.js
```

This script will automatically perform all the steps mentioned below.

If you prefer, you can follow the steps below to set up the project manually.

---

### 2. Install Dependencies

At the root of the repository:

```bash
pnpm install
```

This installs all dependencies across all workspaces.

---

### 3. Configure Environment Files

Create `.env` files for each of the following:

```
apps/api/.env
apps/web/.env
apps/app/.env
packages/prisma-db/.env
packages/sonarqube/.env
```

**Important environment variables for `apps/api/.env`:**

```bash
# Database Configuration
DB_PROVIDER=postgresql  # or 'mongodb'
DATABASE_URL_MONGODB=mongodb://localhost:27017/your-db-name  # if using MongoDB
DATABASE_URL=postgresql://user:password@localhost:5432/db    # if using PostgreSQL

# Multi-Tenancy
SUPER_ADMIN_EMAILS=admin@example.com,another@example.com  # Comma-separated super admin emails

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Field-level encryption for OAuth tokens (generate with: openssl rand -hex 32)
FIELD_ENCRYPTION_KEY=your-64-char-hex-key-here

# Email service (AWS SES or Resend)
AWS_SES_REGION=us-west-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# Error tracking
ROLLBAR_ACCESS_TOKEN=your-rollbar-token
```

Each `.env` file should contain the necessary variables (e.g. database URLs, API base URLs, etc.).

---

### 4. Start the Database

Navigate to the **API app** and start the database via Docker:

```bash
cd apps/api
docker-compose up -d
```

This starts both PostgreSQL and MongoDB containers.

#### If using PostgreSQL (with Prisma)

Setup Prisma:

```bash
cd packages/prisma-db
pnpm prisma migrate deploy
pnpm prisma generate
```

#### If using MongoDB (with Mongoose)

No additional setup needed - Mongoose handles schema creation automatically.

---

### 5. Run the Development Servers

From the **root directory**:

```bash
pnpm dev
```

This command runs all apps (API, Web, and Mobile) concurrently using Turborepo.

---

## 🧠 Project Structure (Simplified)

```
.
├── ...
├── apps/
│   ├── api/         # NestJS API
│   ├── web/         # Next.js Web App
│   └── app/         # Expo Mobile App
│
├── packages/
│   ├── prisma-db/             # Prisma schema + migrations
│   ├── trpc/                  # Shared tRPC router + types
│   ├── eslint-config/         # Linter Config
│   ├── sonarqube/
│   ├── ...
│   └── typescript-config/     # TS Config
│
├── turbo.json       # Turborepo configuration
└── pnpm-workspace.yaml  # Workspace Structure
└── ...
```

---

## 🚀 Scripts

| Command                      | Description                      |
| ---------------------------- | -------------------------------- |
| `pnpm dev`                   | Run all apps in development mode |
| `pnpm prisma migrate deploy` | Apply Prisma migrations          |
| `pnpm prisma generate`       | Generate Prisma client           |

---

## 🧩 Tech Stack Highlights

- ⚡ **Turborepo** – Monorepo management
- 💬 **tRPC** – End-to-end type-safe API communication
- 🧠 **Zod** – Runtime validation & schema definition
- 🗄️ **Database Options** – Choose between:
  - **PostgreSQL + Prisma** – Relational database with type-safe ORM
  - **MongoDB + Mongoose** – NoSQL database with ODM
- 🔐 **Better Auth** – Modern authentication framework with:
  - Three auth methods: Google OAuth, Email OTP, Email & Password
  - Account linking across providers
  - Expo mobile support
  - Email verification
  - OAuth token encryption at rest
- 🏢 **Multi-Tenancy** – Built-in tenant isolation:
  - Role-based access control (Super Admin, Tenant Admin, User)
  - Single-tenant mode for tenant-less applications
  - Tenant-scoped data models
- 🌍 **typesafe-i18n** – Type-safe internationalization:
  - English and Dutch included
  - Runtime-safe translations with TypeScript
- 📊 **TanStack Table v8** – Advanced data grids:
  - Editable, sortable, filterable tables
  - Bulk operations and row selection
  - Nested rows and expandable details
- 📈 **Plotly.js** – Interactive visualizations:
  - 12+ chart types (line, bar, pie, scatter, 3D, heatmap, etc.)
  - WebGL support for performance
  - Zoom, pan, and hover interactions
- 🔒 **GDPR Compliance** – Privacy-first features:
  - Consent tracking with audit logs
  - Data export and deletion
  - Privacy policy templates
- 💻 **Next.js** – Web frontend
- 📱 **Expo (React Native)** – Mobile app
- 🧱 **NestJS** – Backend API
- 🧩 **Shared Packages** – Centralized types & logic

---

## 🧑‍💻 Development Notes

- Keep Docker running while developing backend/API.
- Use `pnpm` consistently — **do not use npm or yarn**.
- Better Auth requires proper environment variables for OAuth providers.

---
