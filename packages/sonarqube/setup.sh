#!/bin/bash

# SonarQube Local Setup Script for macOS
# Optimized for NestJS + Expo + tRPC Mono Repo
# PostgreSQL runs on port 5433 (5432 assumed to be in use)

set -e

echo "=========================================="
echo "SonarQube macOS Setup Script"
echo "For: NestJS + Expo + tRPC Mono Repo"
echo "=========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check system
echo -e "${YELLOW}[Step 1/7]${NC} Checking macOS system..."
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ This script is for macOS only${NC}"
    exit 1
fi
echo -e "${GREEN}✓ macOS detected${NC}"

# Step 2: Check Docker Desktop
echo -e "${YELLOW}[Step 2/7]${NC} Checking Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker Desktop is not installed${NC}"
    echo "Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ Docker is running: $DOCKER_VERSION${NC}"

# Step 3: Check Docker Compose
echo -e "${YELLOW}[Step 3/7]${NC} Checking Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    exit 1
fi
COMPOSE_VERSION=$(docker compose version)
echo -e "${GREEN}✓ Docker Compose available: $COMPOSE_VERSION${NC}"

# Step 4: Check port availability
echo -e "${YELLOW}[Step 4/7]${NC} Checking port availability..."

# Check port 9000 (SonarQube)
if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Port 9000 is in use. SonarQube will use it anyway (will fail if already taken).${NC}"
else
    echo -e "${GREEN}✓ Port 9000 is available${NC}"
fi

# Check port 5433 (PostgreSQL)
if lsof -Pi :5433 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}✗ Port 5433 is already in use${NC}"
    echo "Either:"
    echo "  - Kill the process using port 5433: lsof -ti:5433 | xargs kill -9"
    echo "  - Or change port in docker-compose.yml"
    exit 1
else
    echo -e "${GREEN}✓ Port 5433 is available${NC}"
fi

# Step 5: Stop existing containers
echo -e "${YELLOW}[Step 5/7]${NC} Cleaning up existing containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose-scanner.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 6: Start containers
echo -e "${YELLOW}[Step 6/7]${NC} Starting SonarQube and PostgreSQL..."
echo "This may take a moment on first run..."
docker compose up -d

# Verify containers started
sleep 3
if ! docker ps | grep -q sonarqube-server; then
    echo -e "${RED}✗ SonarQube container failed to start${NC}"
    echo "Checking logs..."
    docker compose logs sonarqube
    exit 1
fi

if ! docker ps | grep -q sonarqube-db; then
    echo -e "${RED}✗ PostgreSQL container failed to start${NC}"
    docker compose logs postgres
    exit 1
fi

echo -e "${GREEN}✓ Containers started successfully${NC}"

# Step 7: Wait for SonarQube
echo -e "${YELLOW}[Step 7/7]${NC} Waiting for SonarQube to initialize..."
echo "This may take 1-2 minutes on first run..."

max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec sonarqube-server curl -s http://localhost:9000/api/system/status 2>/dev/null | grep -q '"status":"UP"'; then
        echo -e "${GREEN}✓ SonarQube is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ SonarQube failed to start within timeout${NC}"
    echo ""
    echo "Check logs with:"
    echo "  docker compose logs -f sonarqube"
    exit 1
fi

echo ""
echo ""
echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Access SonarQube:${NC}"
echo "  URL: ${GREEN}http://localhost:9000${NC}"
echo "  Username: ${GREEN}admin${NC}"
echo "  Password: ${GREEN}admin${NC}"
echo ""
echo -e "${BLUE}Database Info:${NC}"
echo "  Host: ${GREEN}localhost${NC}"
echo "  Port: ${GREEN}5433${NC} (external) / 5432 (internal)"
echo "  Database: ${GREEN}sonarqube${NC}"
echo "  User: ${GREEN}sonarqube${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Open ${GREEN}http://localhost:9000${NC} in your browser"
echo "2. Login with admin / admin"
echo "3. ${YELLOW}IMPORTANT: Change your password immediately${NC}"
echo "4. Create a security token:"
echo "   - Go to: Administration → Security → Users → admin → Tokens"
echo "   - Generate a token (e.g., 'local-scanner')"
echo "5. Run the scanner from your mono repo root:"
echo ""
echo -e "${YELLOW}   # Method 1: Using Docker Compose${NC}"
echo "   docker compose -f docker-compose-scanner.yml run sonarqube-scanner \\"
echo "     -Dsonar.login=YOUR_TOKEN_HERE"
echo ""
echo -e "${YELLOW}   # Method 2: Direct command${NC}"
echo "   docker run --rm \\
  --network sonarqube-network \\
  -v \$(pwd):/usr/src \\
  sonarsource/sonar-scanner-cli \\
  -Dsonar.projectKey=my-monorepo \\
  -Dsonar.sources=. \\
  -Dsonar.host.url=http://sonarqube:9000 \\
  -Dsonar.login=YOUR_TOKEN_HERE"
echo ""
echo "6. View results in the SonarQube dashboard"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:          ${YELLOW}docker compose logs -f sonarqube${NC}"
echo "  Stop services:      ${YELLOW}docker compose down${NC}"
echo "  Stop + remove data: ${YELLOW}docker compose down -v${NC}"
echo "  Restart:            ${YELLOW}docker compose restart${NC}"
echo "  Container status:   ${YELLOW}docker compose ps${NC}"
echo ""
echo -e "${BLUE}For your Mono Repo Structure:${NC}"
echo "  Edit sonar-project.properties to customize:"
echo "  - apps/api (NestJS backend)"
echo "  - apps/mobile (Expo app)"
echo "  - packages/trpc (tRPC utilities)"
echo "  - packages/shared (Shared types/utils)"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  See README.md for complete guide"
echo "  SonarQube Docs: https://docs.sonarqube.org"
echo ""
