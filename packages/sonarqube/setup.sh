#!/bin/bash
# SonarQube Local Setup Script for macOS — uses .env configuration

set -e

# ----------------------------------------
# Load environment variables
# ----------------------------------------
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "⚠️  .env file not found in current directory."
    echo "Please create one first (see example in README)."
    exit 1
fi

# Default fallbacks if missing in .env
POSTGRES_PORT_HOST=${POSTGRES_PORT_HOST:-5433}
SONARQUBE_PORT_HOST=${SONARQUBE_PORT_HOST:-9000}
POSTGRES_CONTAINER_NAME=${POSTGRES_CONTAINER_NAME:-sonarqube-db}
SONAR_CONTAINER_NAME=${SONAR_CONTAINER_NAME:-sonarqube}
POSTGRES_USER=${POSTGRES_USER:-sonar}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-sonar}
POSTGRES_DB=${POSTGRES_DB:-sonar}

# ----------------------------------------
# Color codes
# ----------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "SonarQube macOS Setup Script"
echo "=========================================="

# Step 1: macOS check
echo -e "${YELLOW}[Step 1/7]${NC} Checking macOS system..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}✓ macOS detected${NC}"
else
    echo -e "${RED}✗ Not macOS${NC}"
    exit 1
fi

# Step 2: Docker check
echo -e "${YELLOW}[Step 2/7]${NC} Checking Docker Desktop..."
if ! command -v docker &>/dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi
if ! docker ps &>/dev/null; then
    echo -e "${RED}✗ Docker daemon not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Step 3: Compose check
echo -e "${YELLOW}[Step 3/7]${NC} Checking Docker Compose..."
if ! docker compose version &>/dev/null; then
    echo -e "${RED}✗ Docker Compose not available${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose OK${NC}"

# Step 4: Port checks
echo -e "${YELLOW}[Step 4/7]${NC} Checking ports..."
if lsof -Pi :$SONARQUBE_PORT_HOST -sTCP:LISTEN -t >/dev/null; then
    echo -e "${YELLOW}⚠ Port $SONARQUBE_PORT_HOST is in use${NC}"
else
    echo -e "${GREEN}✓ Port $SONARQUBE_PORT_HOST available${NC}"
fi

if lsof -Pi :$POSTGRES_PORT_HOST -sTCP:LISTEN -t >/dev/null; then
    echo -e "${RED}✗ Port $POSTGRES_PORT_HOST is in use${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Port $POSTGRES_PORT_HOST available${NC}"
fi

# Step 5: Cleanup
echo -e "${YELLOW}[Step 5/7]${NC} Cleaning up containers..."
docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose -f docker-compose-scanner.yml down >/dev/null 2>&1 || true
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 6: Start services
echo -e "${YELLOW}[Step 6/7]${NC} Starting SonarQube + PostgreSQL..."
docker compose up -d

sleep 3
if ! docker ps | grep -q "$SONAR_CONTAINER_NAME"; then
    echo -e "${RED}✗ SonarQube failed${NC}"
    docker compose logs $SONAR_CONTAINER_NAME
    exit 1
fi

if ! docker ps | grep -q "$POSTGRES_CONTAINER_NAME"; then
    echo -e "${RED}✗ PostgreSQL failed${NC}"
    docker compose logs $POSTGRES_CONTAINER_NAME
    exit 1
fi

echo -e "${GREEN}✓ Containers started successfully${NC}"

# Step 7: Wait for SonarQube health
echo -e "${YELLOW}[Step 7/7]${NC} Waiting for SonarQube..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec $SONAR_CONTAINER_NAME wget -qO- http://localhost:$SONARQUBE_PORT_HOST/api/system/status 2>/dev/null | grep -q '"status":"UP"'; then
        echo -e "${GREEN}✓ SonarQube is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
done
if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ Timeout waiting for SonarQube${NC}"
    exit 1
fi

# ----------------------------------------
# Done summary
# ----------------------------------------
echo ""
echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}Access SonarQube:${NC}"
echo -e "  URL: ${GREEN}http://localhost:$SONARQUBE_PORT_HOST${NC}"
echo -e "  Username: ${GREEN}admin${NC}"
echo -e "  Password: ${GREEN}admin${NC}"
echo ""
echo -e "${BLUE}Database:${NC}"
echo -e "  Host: ${GREEN}localhost${NC}"
echo -e "  Port: ${GREEN}$POSTGRES_PORT_HOST${NC}"
echo -e "  DB: ${GREEN}$POSTGRES_DB${NC}"
echo -e "  User: ${GREEN}$POSTGRES_USER${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  docker compose logs -f $SONAR_CONTAINER_NAME"
echo "  docker compose down"
echo "  docker compose restart"
echo "  docker compose ps"
echo ""
echo "Next: open http://localhost:$SONARQUBE_PORT_HOST and create your token for scanning."