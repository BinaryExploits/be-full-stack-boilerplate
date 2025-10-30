# 🎯 START HERE - SonarQube macOS Setup Package

**For: NestJS + Expo + tRPC Mono Repo**  
**PostgreSQL: Port 5433** (avoids conflicts)  
**Total Setup Time: 5-10 minutes**

---

## 📦 What You Have

9 files, 2,433 lines of configuration + documentation

```
docker-compose.yml              ← Server setup (copy to repo)
docker-compose-scanner.yml      ← Scanner setup (copy to repo)
sonar-project.properties        ← Configuration (copy to repo + customize)
setup.sh                        ← Automation script (copy to repo)
README.md                       ← Complete guide
GETTING_STARTED.md              ← Quick start
COMMANDS.md                     ← Command reference
WORKSPACES.md                   ← Workspace examples
.env.example                    ← Environment template
FILES_OVERVIEW.txt              ← Visual overview
```

---

## ⚡ Ultra Quick Start (2 minutes)

```bash
# 1. Copy files to your monorepo
cd /path/to/your/monorepo
cp /path/to/outputs/* .

# 2. Make setup script executable
chmod +x setup.sh

# 3. Run setup (handles everything automatically)
./setup.sh

# 4. Open in browser
open http://localhost:9000

# 5. Login with admin/admin
```

Done! 🎉 SonarQube is running.

---

## 📚 Which Document to Read

| Goal | Read | Time |
|------|------|------|
| **Just get it running** | GETTING_STARTED.md | 3 min |
| **Understand everything** | README.md | 15 min |
| **Find a command** | COMMANDS.md | 1 min |
| **Multi-workspace setup** | WORKSPACES.md | 10 min |
| **See file overview** | FILES_OVERVIEW.txt | 2 min |
| **Need help?** | README.md Troubleshooting | varies |

---

## ✅ First Time Tasks (In Order)

1. **Copy files** to monorepo root
2. **Customize `sonar-project.properties`** for your repo structure
3. **Run `./setup.sh`** (automated setup)
4. **Access** http://localhost:9000
5. **Login** with admin/admin
6. **Generate token** in Administration → Security → Users
7. **Run scanner** with your token
8. **View results** in web UI

---

## 🔥 Super Quick Commands

```bash
# Start
./setup.sh

# Access
open http://localhost:9000

# Scan
docker compose -f docker-compose-scanner.yml run sonarqube-scanner -Dsonar.login=YOUR_TOKEN

# Stop
docker compose down

# Logs
docker compose logs -f sonarqube
```

---

## 🛠️ What's Already Done For You

✅ **Docker Compose Configuration**
- SonarQube server container setup
- PostgreSQL 16 Alpine database
- Health checks and networking
- Volume persistence

✅ **macOS Optimizations**
- Apple Silicon (M1/M2/M3) native support
- Docker Desktop memory tuning
- Port 5433 for PostgreSQL (no conflicts)
- File descriptor limits

✅ **Automated Setup Script**
- Docker verification
- Port availability check
- Container health monitoring
- Ready state detection

✅ **Documentation**
- 5 different guides (beginner to advanced)
- Command reference with examples
- Troubleshooting section
- Workspace configuration examples

✅ **Your Tech Stack Support**
- NestJS (TypeScript backend)
- Expo (React Native mobile)
- tRPC (Type-safe API)
- JavaScript/TypeScript analysis
- Coverage report integration

---

## 🎯 Key Info

**Port Mapping:**
- SonarQube: `http://localhost:9000`
- PostgreSQL: `localhost:5433` (for direct access)

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Files to Copy to Your Repo:**
1. `docker-compose.yml` (don't modify)
2. `docker-compose-scanner.yml` (don't modify)
3. `sonar-project.properties` (customize!)
4. `setup.sh` (don't modify)

**Files for Reference Only:**
- All `.md` files (for your reference)
- `.env.example` (only if using with team)

---

## 🚀 Get Started Now

### Option A: Automated (Recommended)

```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual

```bash
# Step 1: Start containers
docker compose up -d

# Step 2: Wait for startup (1-2 min)
docker compose logs -f sonarqube

# Step 3: Open browser
open http://localhost:9000
```

---

## 💡 Common Customizations

### Change PostgreSQL Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"  # Changed from 5433 to 5434
```

### Increase Memory
Edit `docker-compose.yml`:
```yaml
SONAR_JAVA_OPTS: "-Xmx2G -Xms1G"  # Increased from 1536m
```

### Adjust Source Paths
Edit `sonar-project.properties`:
```properties
sonar.sources=apps/api/src,apps/mobile/src,packages/*/src
```

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Port already in use | See COMMANDS.md → Port issues |
| Docker not running | Spotlight → Docker → Open |
| SonarQube slow | Increase memory in docker-compose.yml |
| Scanner error | Check token, see COMMANDS.md |
| Database error | Run: `docker compose down -v && docker compose up -d` |

---

## 📞 Need Help?

1. **Quick answer** → Check COMMANDS.md
2. **How do I...** → Check README.md
3. **Not working** → See README.md Troubleshooting
4. **Multi-workspace** → Check WORKSPACES.md
5. **Understanding** → Read GETTING_STARTED.md

---

## ✨ Next Steps

1. Copy files to your monorepo
2. Run `./setup.sh`
3. Go to http://localhost:9000
4. Start analyzing your code!

---

**Ready? Let's go!** 🚀

```bash
./setup.sh
```

---

For complete information, see **README.md**
