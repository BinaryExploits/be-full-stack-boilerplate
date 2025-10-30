# Quick Scan Guide

## Prerequisites

1. SonarQube server must be running:
   ```bash
   ./setup.sh
   ```

2. You must have a SonarQube authentication token

## First Time Setup

### Step 1: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

### Step 2: Get Your Token

1. Open http://localhost:9000
2. Login with `admin` / `admin` (or your changed password)
3. Go to: **Administration** → **Security** → **Users**
4. Click on **admin** user
5. Click **Tokens** tab
6. Click **Generate** button
7. Enter token name: `scanner-token`
8. Select **Global Analysis Token** type
9. Click **Generate**
10. **Copy the token** (you won't see it again!)

### Step 3: Update .env File

Edit `.env` and add your token:

```bash
# Authentication Token
SONAR_TOKEN=squ_abc123def456...

# Update project details if needed
SONAR_PROJECT_KEY=my-monorepo
SONAR_PROJECT_NAME=My Awesome Project
SONAR_PROJECT_VERSION=1.0.0
```

## Running Analysis

Simply run:
```bash
./scan.sh
```

The script will:
1. ✅ Check configuration (.env file)
2. ✅ Validate authentication token
3. ✅ Check Docker is running
4. ✅ Verify SonarQube server is up
5. ✅ Check network connectivity
6. ✅ Run code analysis

## What Gets Analyzed

By default, the scanner analyzes:
- ✅ All TypeScript/JavaScript files
- ✅ All source code in the repository
- ❌ Excludes: node_modules, dist, build, .expo, coverage

You can customize in `.env`:
```bash
SONAR_SOURCES=apps/api/src,apps/mobile/src,packages/shared/src
SONAR_EXCLUSIONS=**/node_modules/**,**/dist/**,**/*.test.ts
```

## Including Test Coverage

If you have test coverage reports:

1. Run your tests with coverage:
   ```bash
   npm run test:coverage
   # or
   yarn test:coverage
   # or
   pnpm test:coverage
   ```

2. Update `.env` to point to your coverage file:
   ```bash
   SONAR_JAVASCRIPT_LCOV_REPORTPATHS=coverage/lcov.info
   # or for multiple packages:
   SONAR_JAVASCRIPT_LCOV_REPORTPATHS=apps/api/coverage/lcov.info,apps/mobile/coverage/lcov.info
   ```

3. Run the scanner:
   ```bash
   ./scan.sh
   ```

## Viewing Results

After successful analysis:

1. Open http://localhost:9000
2. Click on your project
3. Review:
   - **Overview** - Quality gate status
   - **Issues** - Code quality problems
   - **Security** - Vulnerabilities & hotspots
   - **Measures** - Detailed metrics
   - **Code** - File-by-file analysis
   - **Activity** - Analysis history

## Troubleshooting

### Token is Invalid
```bash
# Regenerate token in SonarQube UI
# Update .env with new token
./scan.sh
```

### Server Not Running
```bash
# Start SonarQube server
docker compose up -d

# Wait for it to be ready
docker compose logs -f sonarqube

# Run scan
./scan.sh
```

### Scanner Fails
```bash
# View detailed logs
docker compose -f docker-compose-scanner.yml logs

# Check token is correct in .env
cat .env | grep SONAR_TOKEN

# Verify server is accessible
curl http://localhost:9000/api/system/status
```

### Coverage Not Showing
```bash
# 1. Run tests with coverage first
npm run test:coverage

# 2. Verify coverage file exists
ls -la coverage/lcov.info

# 3. Check path in .env
cat .env | grep LCOV

# 4. Run scanner
./scan.sh
```

## Advanced Usage

### Analyze Specific Directory

Edit `.env`:
```bash
SONAR_SOURCES=apps/api/src
```

### Verbose Output

Edit `.env`:
```bash
SONAR_VERBOSE=true
```

### Change Project Version

Edit `.env`:
```bash
SONAR_PROJECT_VERSION=2.0.0
```

## Regular Workflow

For ongoing development:

```bash
# 1. Make code changes
# ... code ...

# 2. Run tests (optional but recommended)
npm run test:coverage

# 3. Run analysis
./scan.sh

# 4. Review results in browser
open http://localhost:9000
```

## CI/CD Integration

You can run the scanner in CI/CD pipelines:

```yaml
# .github/workflows/sonarqube.yml
- name: Run SonarQube Analysis
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  run: |
    cd packages/sonarqube
    ./scan.sh
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./scan.sh` | Run code analysis |
| `docker compose ps` | Check service status |
| `docker compose logs -f sonarqube` | View server logs |
| `docker compose -f docker-compose-scanner.yml logs` | View scanner logs |
| `docker compose down` | Stop services |
| `docker compose up -d` | Start services |

## Need Help?

- Check logs: `docker compose logs -f sonarqube`
- View scanner output: `docker compose -f docker-compose-scanner.yml logs`
- Server status: `curl http://localhost:9000/api/system/status`
- Token issues: Regenerate in SonarQube UI
- Still stuck: Check README.md for detailed troubleshooting
