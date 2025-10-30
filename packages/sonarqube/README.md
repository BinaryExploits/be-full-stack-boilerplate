# SonarQube macOS Setup Guide
## For NestJS + Expo + tRPC Mono Repo

**PostgreSQL Port: 5433** (avoids conflict with existing port 5432)

---

## 🚀 Quick Start (2 minutes)

### Setup (One Time)
```bash
# 1. Make scripts executable
chmod +x setup.sh scan.sh

# 2. Run automated setup
./setup.sh

# 3. Access SonarQube at http://localhost:9000
# Login: admin / admin (change password on first login)
```

### Scanning Your Code (Every Time)
```bash
# 1. Configure your token (one time)
cp .env.example .env
# Edit .env and add your SonarQube token

# 2. Run analysis
./scan.sh

# 3. View results at http://localhost:9000
```

**📖 Detailed scanning guide:** See [SCAN_GUIDE.md](./SCAN_GUIDE.md)

---

## 📋 What's Included

| File | Purpose |
|------|---------|
| `setup.sh` | 🚀 Automated SonarQube server setup |
| `scan.sh` | 📊 Automated code analysis scanner |
| `docker-compose.yml` | SonarQube server + PostgreSQL (port 5433) |
| `docker-compose-scanner.yml` | Scanner container configuration |
| `.env.example` | Environment variables template |
| `.env` | Your local configuration (not in git) |
| `sonar-project.properties` | Project-specific analysis config |
| `SCAN_GUIDE.md` | Detailed scanning documentation |

---

## 🔧 Manual Step-by-Step Setup (if you prefer)

### Step 1: Prerequisites Check

```bash
# Check Docker Desktop is running
docker ps

# Check Docker Compose version (should be v2+)
docker compose version
```

**If Docker Desktop isn't running:**
- Open Applications → Docker.app

### Step 2: Start Services

```bash
# Navigate to your mono repo root
cd /path/to/your/monorepo

# Copy docker-compose.yml to repo root (if not already there)

# Start containers
docker compose up -d

# Verify both started
docker compose ps
```

**Expected output:**
```
NAME              STATUS         PORTS
sonarqube-db      Up (healthy)   5433/tcp
sonarqube-server  Up (healthy)   9000/tcp
```

### Step 3: Wait for SonarQube

```bash
# Watch logs
docker compose logs -f sonarqube

# Or check health
docker exec sonarqube-server curl http://localhost:9000/api/system/health
```

**Wait for:** `{"status":"UP"}`  
**Time:** Usually 1-2 minutes on first start

### Step 4: Access Web UI

1. Open: **http://localhost:9000**
2. Login: `admin` / `admin`
3. **⚠️ Change password immediately** (Administration → Security → Users → admin)

### Step 5: Create Scanner Token

1. Click **Administration** → **Security** → **Users**
2. Click on **admin** user
3. Click **Generate Tokens**
4. Enter name: `local-scanner` or `my-token`
5. **Copy the token** (you'll need it)

### Step 6: Configure Your Mono Repo

Edit `sonar-project.properties` for your structure:

```properties
# NestJS + Expo + tRPC Mono Repo
sonar.projectKey=my-monorepo
sonar.projectName=My Awesome Monorepo
sonar.projectVersion=1.0.0

# Adjust sources based on your folder structure
sonar.sources=apps/*/src,packages/*/src

# Coverage from your workspace
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

**Common structures:**

```properties
# If you have: apps/api (NestJS), apps/mobile (Expo), packages/trpc
sonar.sources=apps/*/src,packages/*/src

# If monorepo root directly has src
sonar.sources=src

# Exclude everything we don't need
sonar.exclusions=**/node_modules/**,**/dist/**,**/.expo/**,**/coverage/**
```

### Step 7: Run Scanner

#### Option A: Docker Compose Scanner (Recommended)

```bash
# Copy docker-compose-scanner.yml to repo root

# Edit it to use your token (replace YOUR_TOKEN)
# Edit line: SONAR_LOGIN: YOUR_TOKEN

# Run
docker compose -f docker-compose-scanner.yml run sonarqube-scanner
```

#### Option B: One-liner Command

```bash
docker run --rm \
  --network sonarqube-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=my-monorepo \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

#### Option C: Local Scanner (No Docker)

```bash
# Install locally (one time)
brew install sonar-scanner

# Run from repo root
sonar-scanner \
  -Dsonar.projectKey=my-monorepo \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

### Step 8: View Results

1. Go to **http://localhost:9000**
2. Click on your project
3. Explore:
   - **Issues** - Code quality problems
   - **Security** - Vulnerabilities
   - **Coverage** - Test coverage %
   - **Duplications** - Repeated code
   - **Measures** - Detailed metrics

---

## 🎯 macOS-Specific Configuration

### Port 5433 (Not 5432)

Your PostgreSQL runs on **5433** to avoid conflicts:

```bash
# Connect from macOS terminal
psql -h localhost -p 5433 -U sonarqube -d sonarqube
```

### Docker Desktop Memory

If you experience slowdowns, increase Docker Desktop memory:

1. Docker Desktop → Preferences → Resources
2. Set **Memory** to 4GB or higher
3. Restart Docker

### M1/M2/M3 Compatibility

All images use `platform: linux/amd64` for native performance.

---

## 📁 Mono Repo Structure Examples

### Example 1: Yarn Workspaces

```
monorepo/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   └── coverage/
│   ├── mobile/           # Expo app
│   │   ├── src/
│   │   └── coverage/
│   └── web/              # Next.js frontend
│       ├── src/
│       └── coverage/
├── packages/
│   ├── trpc/            # tRPC utilities
│   │   └── src/
│   ├── shared/          # Shared types
│   │   └── src/
│   └── ui/              # UI library
│       └── src/
├── coverage/            # Root coverage
└── sonar-project.properties
```

**Configuration:**
```properties
sonar.sources=apps/*/src,packages/*/src
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Example 2: Pnpm Workspaces

```
monorepo/
├── apps/
│   ├── backend/         # NestJS
│   ├── mobile/          # Expo
│   └── web/             # React/Next
├── libs/
│   ├── api-types/       # Shared types
│   ├── trpc/            # tRPC setup
│   └── utils/           # Utilities
└── sonar-project.properties
```

**Configuration:**
```properties
sonar.sources=apps/*/src,libs/*/src
```

### Example 3: Turborepo

```
monorepo/
├── apps/
│   ├── api/             # NestJS
│   └── mobile/          # Expo
├── packages/
│   ├── database/
│   ├── types/
│   └── trpc-config/
└── sonar-project.properties
```

**Configuration:**
```properties
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**
```

---

## 🧪 Generating Coverage Reports

### TypeScript/JavaScript (Vitest, Jest, etc.)

```bash
# In your package.json scripts
"test:coverage": "vitest --coverage"

# Run before scanning
npm run test:coverage
yarn test:coverage
pnpm test:coverage

# This generates coverage/lcov.info
```

### NestJS API

```bash
# In apps/api package.json
"test:coverage": "jest --coverage"

# Configure in sonar-project.properties
sonar.javascript.lcov.reportPaths=apps/api/coverage/lcov.info
```

### React Native / Expo

```bash
# jest.config.js in expo app
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
};

# Run tests
npm run test:coverage

# Point to in config
sonar.javascript.lcov.reportPaths=apps/mobile/coverage/lcov.info
```

---

## 🚀 Advanced Usage

### Running Analysis on Specific Package

```bash
# Analyze only NestJS backend
docker run --rm \
  --network sonarqube-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=my-api \
  -Dsonar.sources=apps/api/src \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=YOUR_TOKEN
```

### CI/CD Integration

**.github/workflows/sonarqube.yml** or equivalent:

```yaml
name: SonarQube Analysis

on: [push, pull_request]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    services:
      sonarqube:
        image: sonarqube:latest
        env:
          SONAR_JDBC_URL: jdbc:postgresql://postgres:5432/sonarqube
          SONAR_JDBC_USERNAME: sonarqube
          SONAR_JDBC_PASSWORD: sonarqube

    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Run SonarQube scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_HOST_URL: http://sonarqube:9000
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Performance Tuning

Edit `docker-compose.yml`:

```yaml
sonarqube:
  environment:
    SONAR_JAVA_OPTS: "-Xmx2G -Xms1G"  # Increase from 1536m
    SONAR_WEB_JAVAOPTS: "-Xmx1G"
    SONAR_CE_JAVAOPTS: "-Xmx1G"
```

---

## 📊 Useful Commands

### Container Management

```bash
# View running containers
docker compose ps

# View container logs
docker compose logs sonarqube
docker compose logs postgres

# Stop all
docker compose down

# Stop + remove data (clean slate)
docker compose down -v

# Restart services
docker compose restart

# Resource usage
docker stats
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it sonarqube-db psql -U sonarqube -d sonarqube

# Backup database
docker exec sonarqube-db pg_dump -U sonarqube -d sonarqube > backup.sql

# Restore database
docker exec -i sonarqube-db psql -U sonarqube -d sonarqube < backup.sql

# Check database size
docker exec sonarqube-db psql -U sonarqube -d sonarqube -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### Scanner Debugging

```bash
# Verbose scanner output
docker compose -f docker-compose-scanner.yml run sonarqube-scanner -Dsonar.verbose=true

# Check SonarQube status
docker exec sonarqube-server curl -s http://localhost:9000/api/system/status | jq .

# View quality gates
docker exec sonarqube-server curl -s http://localhost:9000/api/qualitygates/list | jq .
```

---

## 🐛 Troubleshooting

### Issue: Port 5433 already in use

```bash
# Find what's using it
lsof -i :5433

# Kill the process
kill -9 <PID>

# Or use different port in docker-compose.yml
# Change: "5433:5432" to "5434:5432"
```

### Issue: Docker Desktop not responding

```bash
# Restart Docker
osascript -e 'quit app "Docker"'
sleep 2
open -a Docker

# Or restart from menu: Docker → Restart
```

### Issue: SonarQube stuck initializing

```bash
# Check logs
docker compose logs -f sonarqube

# Common fix: increase memory
# Docker → Preferences → Resources → Memory: 4GB+

# Reset and try again
docker compose down -v
docker compose up -d
```

### Issue: Scanner can't connect to SonarQube

```bash
# Verify network
docker network inspect sonarqube-network

# Use correct hostname (inside Docker network)
# -Dsonar.host.url=http://sonarqube:9000   ✓ Inside containers
# -Dsonar.host.url=http://localhost:9000   ✓ From macOS terminal

# Check SonarQube is running
docker compose ps | grep sonarqube-server
```

### Issue: High CPU/Memory Usage

```bash
# Check Docker stats
docker stats

# Reduce memory allocation
# Edit docker-compose.yml SONAR_JAVA_OPTS from -Xmx1536m to -Xmx1024m

# Restart
docker compose down
docker compose up -d
```

### Issue: Coverage not showing in SonarQube

```bash
# 1. Run tests first
npm run test:coverage

# 2. Verify coverage file exists
ls -la coverage/lcov.info

# 3. Check property path in sonar-project.properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# 4. Re-run scanner
```

---

## 🔐 Security Notes

### For Local Development (Current Setup)

✅ Default admin/admin is fine for local testing

### For Team/Production

```bash
# Create .env file
cp .env.example .env

# Edit .env with strong passwords
POSTGRES_PASSWORD=<strong-password>
SONAR_LOGIN=<secure-token>

# Use in docker-compose
docker compose --env-file .env up -d
```

---

## 📚 Learning Resources

| Resource | Link |
|----------|------|
| SonarQube Docs | https://docs.sonarqube.org |
| Scanner Setup | https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarqube-scanner/ |
| Coverage Reports | https://docs.sonarqube.org/latest/analyzing-source-code/test-coverage/overview/ |
| Quality Gates | https://docs.sonarqube.org/latest/user-guide/quality-gates/ |
| Web API | https://docs.sonarqube.org/latest/extend/web-api/ |

---

## 💡 Next Steps

1. ✅ Run `./setup.sh` to get started
2. ✅ Access **http://localhost:9000** and explore
3. ✅ Create quality gates (Administration → Quality Gates)
4. ✅ Set up CI/CD integration
5. ✅ Configure custom rules
6. ✅ Add webhook notifications
7. ✅ Explore SonarQube plugins (Administration → Marketplace)

---

## 📞 Need Help?

1. Check logs: `docker compose logs -f sonarqube`
2. Verify setup: `docker compose ps`
3. Test connection: `curl http://localhost:9000/api/system/health`
4. Review SonarQube status page: http://localhost:9000/admin/system

---

**Enjoy analyzing your monorepo! 🎉**
