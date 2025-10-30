# 🚀 SonarQube macOS Setup - Getting Started

**For NestJS + Expo + tRPC Mono Repo**  
**PostgreSQL on Port 5433** (to avoid conflicts)

---

## 📦 What You Have

| File | Purpose | When to Use |
|------|---------|-----------|
| `docker-compose.yml` | Main setup (Server + DB) | Always needed |
| `docker-compose-scanner.yml` | Scanner container | When analyzing code |
| `sonar-project.properties` | Configuration | Customize for your repo |
| `setup.sh` | Automated setup | First-time setup (recommended) |
| `README.md` | Complete guide | Reference documentation |
| `COMMANDS.md` | Quick commands | During development |
| `WORKSPACES.md` | Workspace configs | Multi-package setup help |
| `.env.example` | Environment template | Optional - for team/prod use |

---

## ⚡ Quick Start (60 seconds)

### For the Impatient

```bash
chmod +x setup.sh
./setup.sh
```

Then open **http://localhost:9000** and login with `admin/admin`

### Manual 4-Step Start

```bash
# Step 1: Start containers
docker compose up -d

# Step 2: Wait ~1-2 minutes (watch logs)
docker compose logs -f sonarqube

# Step 3: Access UI
open http://localhost:9000

# Step 4: Login with admin/admin
```

---

## 🎯 First-Time Tasks (In Order)

### ✅ 1. Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```
This handles everything: Docker check, port availability, container startup, health verification.

### ✅ 2. Access SonarQube
```bash
open http://localhost:9000
```

### ✅ 3. Change Admin Password
- Click **Administration** (gear icon)
- Go to **Security → Users**
- Click on **admin**
- Enter new password

### ✅ 4. Create Scanner Token
- In **Administration → Security → Users**
- Click on **admin** user
- Click **Generate Tokens**
- Name it: `local-scanner`
- **Copy the token** (save it)

### ✅ 5. Configure Your Repo
Edit `sonar-project.properties`:
```properties
sonar.projectKey=my-monorepo
sonar.projectName=My Awesome Monorepo
sonar.sources=apps/*/src,packages/*/src  # Adjust to your structure
```

### ✅ 6. Run Scanner
```bash
# Generate coverage first
npm run test:coverage

# Then scan
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=YOUR_TOKEN_HERE
```

### ✅ 7. View Results
Visit **http://localhost:9000** and explore your project

---

## 📍 File Locations & What to Do

### In Your Mono Repo Root, You Need:

```bash
your-monorepo/
├── docker-compose.yml              ← Copy from outputs/
├── docker-compose-scanner.yml      ← Copy from outputs/
├── sonar-project.properties        ← Copy & customize from outputs/
├── .env.example                    ← Optional, from outputs/
└── setup.sh                        ← Copy & make executable
```

### Put Everything From Outputs Into Your Repo

```bash
# From outputs directory:
cp docker-compose.yml /path/to/your/monorepo/
cp docker-compose-scanner.yml /path/to/your/monorepo/
cp sonar-project.properties /path/to/your/monorepo/
cp setup.sh /path/to/your/monorepo/
cp .env.example /path/to/your/monorepo/
chmod +x /path/to/your/monorepo/setup.sh
```

---

## 🔧 Common Commands

### Start/Stop

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View status
docker compose ps

# Watch logs
docker compose logs -f sonarqube
```

### Scanner

```bash
# Run scanner (from repo root)
docker compose -f docker-compose-scanner.yml run sonarqube-scanner

# With token
docker compose -f docker-compose-scanner.yml run sonarqube-scanner \
  -Dsonar.login=YOUR_TOKEN
```

### Database

```bash
# Access database
docker exec -it sonarqube-db psql -U sonarqube -d sonarqube

# Backup
docker exec sonarqube-db pg_dump -U sonarqube -d sonarqube > backup.sql
```

---

## 🐛 Troubleshooting Checklist

### Issue: Port 5433 already in use
```bash
lsof -i :5433  # Find what's using it
kill -9 <PID>  # Kill it
```

### Issue: Docker Desktop not running
- Open Applications → Docker.app
- Or use Spotlight: Cmd+Space → Docker

### Issue: SonarQube taking forever to start
- Wait 1-2 minutes (normal)
- Check logs: `docker compose logs sonarqube`
- If stuck: `docker compose down -v` then restart

### Issue: Scanner says "Unauthorized"
- Token expired or wrong
- Generate new one in UI
- Use correct token: `-Dsonar.login=YOUR_TOKEN`

### Issue: Can't connect to Docker
- Restart Docker: Cmd+Q to quit, then reopen
- Or: Docker menu → Restart

---

## 📊 Your Tech Stack Covered

✅ **NestJS** - TypeScript/JavaScript backend  
✅ **Expo** - React Native mobile  
✅ **tRPC** - Type-safe API  
✅ **Shared Types** - TypeScript types  
✅ **UI Libraries** - React components  

**All analyzed in one scan!**

---

## 🎓 Understanding the Setup

### docker-compose.yml
- **PostgreSQL** (port 5433): Database for SonarQube
- **SonarQube** (port 9000): The analysis UI

**Why two services?**
- SonarQube needs a database to store results
- PostgreSQL Alpine 16 is lightweight and fast

### sonar-project.properties
Tells SonarQube where to look and what to analyze:
- `sonar.sources` = Which folders to scan
- `sonar.exclusions` = What to skip
- `sonar.javascript.lcov.reportPaths` = Where coverage reports are

### setup.sh
Automated script that:
1. ✓ Checks Docker is running
2. ✓ Verifies ports are available
3. ✓ Cleans up old containers
4. ✓ Starts new ones
5. ✓ Waits until SonarQube is ready
6. ✓ Gives you next steps

---

## 🚦 How to Know It's Working

### ✅ Containers Running
```bash
$ docker compose ps
NAME                STATUS           PORTS
sonarqube-db        Up (healthy)     5433/tcp
sonarqube-server    Up (healthy)     9000/tcp
```

### ✅ Web UI Accessible
- Open http://localhost:9000
- See SonarQube login page

### ✅ Database Connected
```bash
$ docker compose logs postgres
PostgreSQL is running
```

### ✅ Scan Completes
- Scanner prints "ANALYSIS SUCCESSFUL"
- Results appear in http://localhost:9000

---

## 💡 Pro Tips for macOS

### Memory Issues?
```bash
# In docker-compose.yml, change this line:
SONAR_JAVA_OPTS: "-Xmx1024m -Xms512m"  # Reduce from 1536m

# Then restart
docker compose restart sonarqube
```

### Speed Up Scans?
```bash
# Generate coverage first
npm run test:coverage

# Then scan only includes coverage
docker compose -f docker-compose-scanner.yml run sonarqube-scanner
```

### Keep Data Between Restarts?
```bash
# Current setup uses volumes (they persist)
# To keep forever: Use named volumes (already done!)

# To clear everything (WARNING!)
docker compose down -v
```

---

## 📚 Additional Resources

| Need | Where |
|------|-------|
| **Complete Guide** | Read `README.md` |
| **All Commands** | See `COMMANDS.md` |
| **Workspace Help** | Check `WORKSPACES.md` |
| **Environment Setup** | Edit `.env.example` |
| **SonarQube Docs** | https://docs.sonarqube.org |

---

## 🎯 Next Steps After First Setup

1. **Explore Dashboard** - See what SonarQube found
2. **Set Quality Gates** - Define standards
3. **Add to Git** - Commit docker-compose files
4. **CI/CD** - Add to GitHub Actions/GitLab CI
5. **Team Sharing** - Share setup with team

---

## 🆘 Quick Help Links

| Problem | Command |
|---------|---------|
| View all logs | `docker compose logs` |
| View SonarQube logs | `docker compose logs sonarqube` |
| Stop everything | `docker compose down` |
| Clean restart | `docker compose down -v && docker compose up -d` |
| Check health | `curl http://localhost:9000/api/system/health` |
| Database access | `docker exec -it sonarqube-db psql -U sonarqube` |

---

## ✨ You're All Set!

```
🟢 SonarQube running on http://localhost:9000
🟢 PostgreSQL running on localhost:5433
🟢 Ready to analyze your monorepo
🟢 All files configured for macOS
```

### Right Now You Can:

1. Open http://localhost:9000
2. Login with admin/admin
3. Create projects
4. Run scans
5. View analytics

### Next Session:

```bash
# Just restart with
docker compose up -d

# And scan with
docker compose -f docker-compose-scanner.yml run sonarqube-scanner -Dsonar.login=YOUR_TOKEN
```

---

**Happy analyzing! 🚀**

**Questions?** Check README.md or COMMANDS.md in this folder.
