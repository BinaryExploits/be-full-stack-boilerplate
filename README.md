# 🧩 BE Tech Stack Monorepo

A **modern full-stack TypeScript monorepo** using:

* **Next.js** (Web)
* **NestJS** (API)
* **Expo** (Mobile)
* **tRPC** (End-to-end type-safe API calls)
* **Prisma + PostgreSQL** (Database)
* **Turborepo** (Build orchestration)

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

### 1. Clone the Repository

```bash
git clone https://github.com/Ansi007/full-stack.git
cd full-stack
```

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
```

Each `.env` file should contain the necessary variables (e.g. database URLs, API base URLs, etc.).

---

### 4. Start the Database

Navigate to the **API app** and start the database via Docker:

```bash
cd apps/api
docker-compose up -d
```

This spins up the PostgreSQL container defined in your `docker-compose.yml`.

---

### 5. Setup Prisma (Database)

Go to the Prisma package:

```bash
cd packages/prisma-db
```

Run the following commands:

```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

---

### 6. Run the Development Servers

From the **root directory**:

```bash
pnpm dev
```

This command runs all apps (API, Web, and Mobile) concurrently using Turborepo.

---

## 🧠 Project Structure

```
.
├── apps/
│   ├── api/         # NestJS API
│   ├── web/         # Next.js Web App
│   └── app/         # Expo Mobile App
│
├── packages/
│   ├── prisma-db/   # Prisma schema + migrations
│   ├── trpc/        # Shared tRPC router + types
│   ├── eslint-config/        # Shared tRPC router + types
│   └── typescript-config/          # Shared UI components
│
├── turbo.json       # Turborepo configuration
└── pnpm-workspace.yaml
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

* ⚡ **Turborepo** – Monorepo management
* 💬 **tRPC** – End-to-end type-safe API communication
* 🧠 **Zod** – Runtime validation
* 🗄️ **Prisma ORM** – Database modeling
* 🐘 **PostgreSQL** – Database
* 💻 **Next.js** – Web frontend
* 📱 **Expo (React Native)** – Mobile app
* 🧱 **NestJS** – Backend API
* 🧩 **Shared Packages** – Centralized types & logic

---

## 🧑‍💻 Development Notes

* If you face network issues on mobile, ensure Expo can reach your local IP (use `ifconfig` or `ipconfig` to find it).
* Keep Docker running while developing backend/API.
* Use `pnpm` consistently — **do not use npm or yarn**.

---
