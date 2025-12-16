# 🧩 BE Full Stack Boilerplate

A **modern full-stack TypeScript monorepo** using:

- **Next.js** (Web)
- **NestJS** (API)
- **Expo** (Mobile)
- **tRPC** (End-to-end type-safe API calls)
- **PostgreSQL** or **MongoDB** (Database - your choice!)
- **Prisma** or **Mongoose** (ORM/ODM - based on your DB choice)
- **Better Auth** (Authentication with OAuth, Email OTP)
- **SonarQube** (Code quality)
- **Rollbar** (Error tracking)
- **Turborepo** (Build orchestration)

This repository is structured for scalability, developer experience, and seamless cross-platform sharing of logic and types.

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

### 1. Clone the Repository

```bash
git clone https://github.com/BinaryExploits/be-full-stack-boilerplate.git
cd be-full-stack-boilerplate
```

Once the repository is cloned, you can run an **automated setup script** from the root to prepare dependencies and the project:

```bash
npm run setup
```

or

```bash
node setup.js
```

This script will automatically perform all the steps mentioned below.

⚠️ You may still need to manually update some values in your .env files as required.

Alternatively, you can follow the steps mentioned below manually to set up the project.

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

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email service, Rollbar, etc.
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
  - Email OTP authentication
  - Google OAuth
  - Expo mobile support
  - Email verification
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
