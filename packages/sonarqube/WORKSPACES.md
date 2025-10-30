# Mono Repo Workspace Configurations

Complete configuration examples for different mono repo setups with NestJS, Expo, and tRPC.

---

## 📦 Yarn Workspaces Setup

### Directory Structure

```
monorepo/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   ├── test/
│   │   ├── coverage/
│   │   ├── package.json
│   │   └── jest.config.js
│   ├── mobile/                 # Expo app
│   │   ├── src/
│   │   ├── __tests__/
│   │   ├── coverage/
│   │   ├── package.json
│   │   └── jest.config.js
│   └── web/                    # Next.js frontend
│       ├── src/
│       ├── __tests__/
│       ├── coverage/
│       ├── package.json
│       └── jest.config.js
├── packages/
│   ├── trpc/                   # tRPC setup & types
│   │   ├── src/
│   │   ├── __tests__/
│   │   ├── coverage/
│   │   └── package.json
│   ├── database/               # Database utilities
│   │   ├── src/
│   │   ├── __tests__/
│   │   └── package.json
│   ├── types/                  # Shared types
│   │   ├── src/
│   │   └── package.json
│   └── ui/                     # Shared UI components
│       ├── src/
│       ├── __tests__/
│       └── package.json
├── sonar-project.properties
├── docker-compose.yml
├── docker-compose-scanner.yml
├── package.json
└── yarn.lock
```

### Configuration: sonar-project.properties

```properties
# Yarn Workspaces Configuration
sonar.projectKey=my-monorepo
sonar.projectName=My Monorepo (Yarn Workspaces)
sonar.projectVersion=1.0.0

# Include all workspace sources
sonar.sources=apps/*/src,packages/*/src

# Exclude build outputs and dependencies
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/build/**,\
  **/.expo/**,\
  **/coverage/**,\
  **/.next/**,\
  **/\.cache/**

# TypeScript configuration
sonar.typescript.tslint.configPath=./tsconfig.json

# Coverage: Yarn workspaces typically output to each workspace
sonar.javascript.lcov.reportPaths=\
  apps/api/coverage/lcov.info,\
  apps/mobile/coverage/lcov.info,\
  apps/web/coverage/lcov.info,\
  packages/trpc/coverage/lcov.info,\
  packages/database/coverage/lcov.info,\
  packages/ui/coverage/lcov.info
```

### Root package.json Scripts

```json
{
  "scripts": {
    "test": "yarn workspaces run test",
    "test:coverage": "yarn workspaces run test:coverage",
    "analyze:sonar": "docker compose -f docker-compose-scanner.yml run sonarqube-scanner"
  }
}
```

### Individual workspace jest.config.js

```javascript
// apps/api/jest.config.js (example for NestJS)
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

---

## 🔧 pnpm Workspaces Setup

### Directory Structure

```
monorepo/
├── apps/
│   ├── backend/                # NestJS
│   │   └── src/
│   ├── mobile/                 # Expo
│   │   └── src/
│   └── web/                    # Next.js
│       └── src/
├── libs/
│   ├── api-types/              # Shared API types
│   │   └── src/
│   ├── trpc/                   # tRPC utilities
│   │   └── src/
│   └── utils/                  # General utilities
│       └── src/
├── sonar-project.properties
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'libs/*'
```

### Configuration: sonar-project.properties

```properties
# pnpm Workspaces Configuration
sonar.projectKey=my-pnpm-monorepo
sonar.projectName=My pnpm Monorepo
sonar.projectVersion=1.0.0

sonar.sources=apps/*/src,libs/*/src

sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/.pnpm/**,\
  **/coverage/**

# pnpm stores coverage at workspace level
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Root package.json (pnpm)

```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "test:coverage:merge": "npx nyc merge coverage coverage/merged-coverage.json && npx nyc report -r lcov --reporter=lcov",
    "analyze:sonar": "pnpm test:coverage:merge && docker compose -f docker-compose-scanner.yml run sonarqube-scanner"
  }
}
```

---

## 🚀 Turborepo Setup

### Directory Structure

```
monorepo/
├── apps/
│   ├── api/                    # NestJS
│   │   ├── src/
│   │   ├── src/__tests__/
│   │   ├── coverage/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── mobile/                 # Expo
│   │   ├── src/
│   │   ├── __tests__/
│   │   ├── coverage/
│   │   └── package.json
│   └── web/                    # Next.js
│       ├── src/
│       ├── src/__tests__/
│       ├── coverage/
│       └── package.json
├── packages/
│   ├── trpc-router/            # tRPC routers
│   │   ├── src/
│   │   └── package.json
│   ├── database/               # Prisma/DB
│   │   ├── src/
│   │   └── package.json
│   ├── types/                  # Shared types
│   │   ├── src/
│   │   └── package.json
│   └── ui/                     # React components
│       ├── src/
│       └── package.json
├── turbo.json
├── sonar-project.properties
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": {
      "outputs": ["dist/**", "build/**"],
      "cache": false,
      "dependsOn": ["^build"]
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": false
    },
    "test:coverage": {
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Configuration: sonar-project.properties

```properties
# Turborepo Configuration
sonar.projectKey=my-turborepo
sonar.projectName=My Turborepo Project
sonar.projectVersion=1.0.0

# Include all workspace sources
sonar.sources=.

# Exclude common artifacts
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/.turbo/**,\
  **/coverage/**,\
  **/.next/**,\
  **/.expo/**

# Coverage from each package
sonar.javascript.lcov.reportPaths=\
  apps/api/coverage/lcov.info,\
  apps/mobile/coverage/lcov.info,\
  apps/web/coverage/lcov.info,\
  packages/*/coverage/lcov.info
```

### Root package.json (Turborepo)

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "analyze:sonar": "npm run test:coverage && docker compose -f docker-compose-scanner.yml run sonarqube-scanner"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

---

## 🎯 NestJS-Specific Configuration

### Backend (NestJS) Jest Setup

**apps/api/jest.config.js:**

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

**apps/api/package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.x.x",
    "@types/jest": "^29.x.x",
    "jest": "^29.x.x",
    "ts-jest": "^29.x.x"
  }
}
```

---

## 📱 React Native / Expo Configuration

### Mobile (Expo) Jest Setup

**apps/mobile/jest.config.js:**

```javascript
module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: [
    '<rootDir>/.expo',
    '<rootDir>/node_modules',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo|@react-native|react-native-screens|react-native-gesture-handler|react-native-reanimated|@react-navigation|react-native-safe-area-context)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html'],
};
```

**apps/mobile/package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.x.x",
    "jest-expo": "^49.x.x",
    "@testing-library/react-native": "^12.x.x"
  }
}
```

---

## 🔀 tRPC + TypeScript Configuration

### Shared Types & tRPC Setup

**packages/trpc/src/index.ts:**

```typescript
import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

export const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
```

**packages/types/src/index.ts:**

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}
```

---

## 🧪 Coverage Configuration (All Platforms)

### Generate Combined Coverage Report

**Root package.json:**

```json
{
  "scripts": {
    "test:coverage:all": "npm run test:coverage -r && npm run coverage:merge",
    "coverage:merge": "nyc merge . coverage/merged.json && nyc report --reporter=lcov --reporter=text"
  },
  "devDependencies": {
    "nyc": "^15.x.x"
  }
}
```

### .nycrc Configuration

```json
{
  "all": true,
  "include": [
    "apps/*/src/**/*.ts",
    "apps/*/src/**/*.tsx",
    "packages/*/src/**/*.ts",
    "packages/*/src/**/*.tsx"
  ],
  "exclude": [
    "**/*.d.ts",
    "**/*.stories.tsx",
    "**/tests/**",
    "**/__tests__/**",
    "**/node_modules/**",
    "**/dist/**"
  ],
  "reporter": ["lcov", "text", "html"],
  "report-dir": "./coverage"
}
```

---

## 🔗 Running SonarQube Scans

### Scan All Workspaces

```bash
# Generate coverage for all workspaces
npm run test:coverage

# Or specific workspace
npm run test:coverage --workspace=@myrepo/api

# Then scan
docker compose -f docker-compose-scanner.yml run sonarqube-scanner
```

### Scan Specific Package

```bash
# Only NestJS API
docker run --rm \
  --network sonarqube-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=my-api \
  -Dsonar.sources=apps/api/src \
  -Dsonar.javascript.lcov.reportPaths=apps/api/coverage/lcov.info \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=YOUR_TOKEN

# Only Mobile (Expo)
docker run --rm \
  --network sonarqube-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=my-mobile \
  -Dsonar.sources=apps/mobile/src \
  -Dsonar.javascript.lcov.reportPaths=apps/mobile/coverage/lcov.info \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=YOUR_TOKEN
```

---

## 📊 Quality Gates for Monorepo

Create different quality gates for different packages:

### For APIs (NestJS)

```
- Coverage > 80%
- Duplications < 3%
- Security Rating: A
- Reliability Rating: A
- Maintainability Rating: A
```

### For Mobile Apps (Expo)

```
- Coverage > 70%
- Duplications < 5%
- Security Rating: A
- No critical issues
```

### For Shared Libraries

```
- Coverage > 90%
- Duplications < 2%
- Zero debt ratio
- No critical/major issues
```

---

## 🎯 Next Steps

1. Choose your workspace manager (Yarn, pnpm, Turborepo)
2. Copy the relevant `sonar-project.properties` configuration
3. Update package.json scripts
4. Update jest.config.js files
5. Run `npm run test:coverage` (or equivalent)
6. Run `./setup.sh` to start SonarQube
7. Scan with `docker compose -f docker-compose-scanner.yml run sonarqube-scanner`

**Happy analyzing! 🚀**
