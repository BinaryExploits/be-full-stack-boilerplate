# SonarQube macOS - Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# First time setup (automated)
chmod +x setup.sh
./setup.sh

# Access SonarQube
open http://localhost:9000

# Login
username: admin
password: admin
```

---

## 📌 Essential Commands

### Start & Stop

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# Stop and remove all data (clean slate)
docker compose down -v

# Restart
docker compose restart

# View status
docker compose ps
```

### Logs & Debugging

```bash
# Watch SonarQube logs
docker compose logs -f sonarqube

# Watch PostgreSQL logs
docker compose logs -f postgres

# View both logs
docker compose logs -f

# View logs from specific time
docker compose logs sonarqube --tail 100
```

---

## 🧹 Scanner Commands

### Using Docker Compose Scanner

```bash
# Basic scan (uses credentials from docker-compose-scanner.yml)
docker compose -f docker-compose-scanner.yml run sonarqube-scanner

# With specific token
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=YOUR_TOKEN_HERE

# With verbose output
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.verbose=true
```

### Using One-Liner Command

```bash
# Replace YOUR_TOKEN_HERE with your actual token
docker run --rm \
  --network sonarqube-network \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=my-monorepo \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

### Using Local Scanner Installation

```bash
# Install (one time)
brew install sonar-scanner

# Scan
sonar-scanner \
  -Dsonar.projectKey=my-monorepo \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN_HERE
```

---

## 🗄️ Database Commands

### Connect to Database

```bash
# Access PostgreSQL CLI
docker exec -it sonarqube-db psql -U sonarqube -d sonarqube

# Once connected:
\dt                    # List tables
\q                     # Exit

# Get database size
docker exec sonarqube-db psql -U sonarqube -d sonarqube \
  -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### Backup & Restore

```bash
# Backup database to file
docker exec sonarqube-db pg_dump -U sonarqube -d sonarqube > backup.sql

# Restore from backup
docker exec -i sonarqube-db psql -U sonarqube -d sonarqube < backup.sql
```

---

## 🔍 Health Checks

### Verify Services Running

```bash
# Check containers
docker compose ps

# Check SonarQube health endpoint
docker exec sonarqube-server curl -s http://localhost:9000/api/system/health | jq .

# Check SonarQube status page (web UI)
open http://localhost:9000/admin/system

# Check database connectivity
docker exec sonarqube-db psql -U sonarqube -d sonarqube -c "SELECT 1;"
```

### Monitor Resource Usage

```bash
# Real-time resource monitor
docker stats

# Check disk space
docker system df

# View container details
docker compose ps --no-trunc
```

---

## 🧬 Coverage & Testing

### Generate Coverage Reports

```bash
# For TypeScript/JavaScript projects
npm run test:coverage
yarn test:coverage
pnpm test:coverage

# For NestJS
npm run test:cov

# For monorepo (run in each package)
npm run test:coverage --workspace=@myrepo/api
npm run test:coverage --workspace=@myrepo/mobile
```

### Scan with Coverage

```bash
# Generate coverage first
npm run test:coverage

# Then scan (SonarQube will pick up coverage automatically)
docker compose -f docker-compose-scanner.yml run sonarqube-scanner
```

---

## 🔐 Token Management

### Create Token (One Time)

1. Open **http://localhost:9000**
2. Click **Administration** → **Security** → **Users**
3. Click **admin** user
4. Click **Generate Tokens**
5. Enter name: `local-scanner`
6. Copy token and save it

### Use Token in Commands

```bash
# Define as variable
TOKEN="your_token_here"

# Use in scanner command
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=$TOKEN

# Or pass directly
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=sqp_abc123xyz...
```

---

## 🛠️ Troubleshooting

### SonarQube Won't Start

```bash
# Check logs
docker compose logs sonarqube

# Increase memory (Docker Preferences → Resources → Memory: 4GB+)

# Reset and try again
docker compose down -v
docker compose up -d
```

### Port Already in Use

```bash
# Find what's using port 5433
lsof -i :5433

# Kill the process
kill -9 <PID>

# Or use different port in docker-compose.yml
# Change line: "5433:5432" to "5434:5432"
```

### Scanner Connection Issues

```bash
# Verify SonarQube is running
docker compose ps | grep sonarqube-server

# Test connectivity from scanner container
docker exec sonarqube-scanner curl -f http://sonarqube:9000/api/system/health

# Use localhost instead of hostname if running from macOS terminal
-Dsonar.host.url=http://localhost:9000
```

### Docker Desktop Issues

```bash
# Restart Docker completely
osascript -e 'quit app "Docker"'
sleep 2
open -a Docker

# Or: Docker menu → Restart

# Check Docker status
docker ps
docker version
```

---

## 📊 Performance Tips

### For Mac with Limited Resources

```bash
# In docker-compose.yml, reduce memory:
SONAR_JAVA_OPTS: "-Xmx1024m -Xms512m"

# Restart
docker compose down
docker compose up -d
```

### For Mac with Plenty of Resources (16GB+)

```bash
# In docker-compose.yml, increase memory:
SONAR_JAVA_OPTS: "-Xmx2G -Xms1G"

# Better PostgreSQL settings:
POSTGRES_INITDB_ARGS: "-c shared_buffers=512MB -c effective_cache_size=2GB"
```

---

## 🔗 Useful URLs (when running)

| URL | Purpose |
|-----|---------|
| http://localhost:9000 | Main UI |
| http://localhost:9000/admin | Administration |
| http://localhost:9000/api/system/health | Health check |
| http://localhost:9000/api/system/status | System status |
| http://localhost:9000/admin/users | User management |
| http://localhost:9000/admin/tokens | Token management |

---

## 📁 File Organization (your repo)

```
your-monorepo/
├── docker-compose.yml              ← Server + DB config
├── docker-compose-scanner.yml      ← Scanner config
├── sonar-project.properties        ← SonarQube settings
├── .env.example                    ← Environment template
├── setup.sh                        ← Automated setup
└── apps/
    ├── api/          (NestJS)
    ├── mobile/       (Expo)
    └── web/          (React/Next)
```

---

## 💾 Backup & Recovery

### Quick Backup

```bash
# Backup database only
docker exec sonarqube-db pg_dump -U sonarqube -d sonarqube > sonarqube_backup.sql

# Backup everything (with volumes)
docker compose exec sonarqube-server tar czf /tmp/sonarqube_data.tar.gz /opt/sonarqube/data

# Copy from container
docker cp sonarqube-server:/tmp/sonarqube_data.tar.gz ./backup/
```

### Recovery

```bash
# Restore database
docker exec -i sonarqube-db psql -U sonarqube -d sonarqube < sonarqube_backup.sql

# Restart to apply changes
docker compose restart sonarqube
```

---

## 🎯 Common Workflows

### Full Scan Workflow (Step-by-Step)

```bash
# 1. Generate test coverage
npm run test:coverage

# 2. Start SonarQube (if not running)
docker compose up -d

# 3. Wait for SonarQube
sleep 30

# 4. Generate/get your token (if first time)
# Visit http://localhost:9000 → Admin → Users → admin → Tokens

# 5. Run scan
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=YOUR_TOKEN

# 6. View results
open http://localhost:9000
```

### CI/CD Ready Command

```bash
# Perfect for GitHub Actions, GitLab CI, Jenkins, etc.
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.projectKey=my-monorepo \
  -Dsonar.projectVersion=$CI_COMMIT_SHA \
  -Dsonar.login=$SONAR_TOKEN
```

---

## 📚 Where to Go Next

1. **Explore UI:** http://localhost:9000 → Projects → Your Project
2. **Set Quality Gates:** Administration → Quality Gates → Create
3. **Configure Rules:** Administration → Rules → Filter by language
4. **Add Webhooks:** Administration → Webhooks → Create
5. **Read Docs:** https://docs.sonarqube.org

---

## 🆘 Emergency Commands

```bash
# Stop everything immediately
docker compose down

# Complete reset (WARNING: deletes all data)
docker compose down -v

# Remove specific container
docker remove sonarqube-server

# View detailed logs (debugging)
docker compose logs sonarqube --tail 200 -f

# SSH into container (advanced)
docker exec -it sonarqube-server /bin/bash
```

---

**Happy analyzing! 🎉**
