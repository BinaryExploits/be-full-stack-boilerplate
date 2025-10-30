#!/bin/bash

# SonarQube Scanner Script for macOS
# Automates code analysis for your monorepo

set -e

echo "=========================================="
echo "SonarQube Code Analysis Scanner"
echo "=========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Check if .env file exists
echo -e "${YELLOW}[Step 1/6]${NC} Checking configuration..."
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo ""
    echo "Please create a .env file with your SonarQube configuration."
    echo "You can copy from .env.example:"
    echo ""
    echo -e "${YELLOW}  cp .env.example .env${NC}"
    echo ""
    echo "Then edit .env and add your SonarQube token and project details."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Step 2: Validate token
echo -e "${YELLOW}[Step 2/6]${NC} Validating authentication token..."
if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${RED}✗ SONAR_TOKEN is not set in .env file${NC}"
    echo ""
    echo "Please add your SonarQube token to .env file:"
    echo ""
    echo "1. Open ${SONAR_HOST_URL:-http://localhost:9000}"
    echo "2. Login as admin"
    echo "3. Go to: Administration → Security → Users → admin → Tokens"
    echo "4. Generate a token (e.g., 'scanner-token')"
    echo "5. Copy the token and add it to .env file:"
    echo ""
    echo -e "${YELLOW}   SONAR_TOKEN=your-token-here${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Token configured${NC}"

# Step 3: Check Docker
echo -e "${YELLOW}[Step 3/6]${NC} Checking Docker..."
if ! docker ps &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Step 4: Check SonarQube server
echo -e "${YELLOW}[Step 4/6]${NC} Checking SonarQube server..."
if ! docker ps | grep -q "${SONAR_CONTAINER_NAME:-sonarqube}"; then
    echo -e "${RED}✗ SonarQube server is not running${NC}"
    echo ""
    echo "Please start SonarQube server first:"
    echo -e "${YELLOW}  ./setup.sh${NC}"
    echo ""
    echo "Or if already set up:"
    echo -e "${YELLOW}  docker compose up -d${NC}"
    echo ""
    exit 1
fi

echo "Checking server health..."
max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec ${SONAR_CONTAINER_NAME:-sonarqube} wget -qO- ${SONAR_HOST_URL:-http://localhost:9000}/api/system/status 2>/dev/null | grep -q '"status":"UP"'; then
        echo -e "${GREEN}✓ SonarQube server is UP${NC}"
        break
    fi
    if [ $attempt -eq 0 ]; then
        echo -n "Waiting for server to be ready"
    fi
    echo -n "."
    attempt=$((attempt + 1))
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo -e "${RED}✗ SonarQube server is not responding${NC}"
    echo "Check logs: docker compose logs -f ${SONAR_CONTAINER_NAME:-sonarqube}"
    exit 1
fi
echo ""

# Step 5: Check network
echo -e "${YELLOW}[Step 5/6]${NC} Checking Docker network..."
SONARQUBE_NETWORK=$(docker network ls --format '{{.Name}}' | grep -E "${SONARQUBE_NETWORK_NAME:-sonarqube_sonarqube-net}|sonarqube_sonarqube-net" | head -n 1)

if [ -z "$SONARQUBE_NETWORK" ]; then
    echo -e "${RED}✗ SonarQube network not found${NC}"
    echo "Please ensure SonarQube server is running:"
    echo -e "${YELLOW}  docker compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Network detected:${NC} $SONARQUBE_NETWORK"

# Step 6: Run scanner
echo -e "${YELLOW}[Step 6/6]${NC} Starting code analysis..."
echo ""
echo -e "${BLUE}Project: ${SONAR_PROJECT_NAME:-my-project}${NC}"
echo -e "${BLUE}Version: ${SONAR_PROJECT_VERSION:-1.0.0}${NC}"
echo -e "${BLUE}Scanning: ${SONAR_SOURCES:-.}${NC} (from project root)"
echo ""

echo "Running scanner... (this may take a few minutes)"
echo ""

docker compose -f docker-compose-scanner.yml run --rm sonarqube-scanner 2>&1 | grep -v "Found orphan containers"

if [ $? -eq 0 ]; then
    echo ""
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "✓ Analysis Complete!${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}View Results:${NC}"
    echo -e "  URL: ${GREEN}${SONAR_HOST_URL:-http://localhost:9000}${NC}"
    echo -e "  Project: ${GREEN}${SONAR_PROJECT_KEY:-my-monorepo}${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "1. Open ${GREEN}${SONAR_HOST_URL:-http://localhost:9000}${NC}"
    echo -e "2. Click on your project: ${GREEN}${SONAR_PROJECT_NAME:-my-monorepo}${NC}"
    echo "3. Review:"
    echo -e "   - ${YELLOW}Issues${NC} - Code quality problems"
    echo -e "   - ${YELLOW}Security${NC} - Vulnerabilities & hotspots"
    echo -e "   - ${YELLOW}Coverage${NC} - Test coverage metrics"
    echo -e "   - ${YELLOW}Duplications${NC} - Repeated code blocks"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo -e "  Re-run analysis:    ${YELLOW}./scan.sh${NC}"
    echo -e "  View server logs:   ${YELLOW}docker compose logs -f ${SONAR_CONTAINER_NAME:-sonarqube}${NC}"
    echo -e "  View scanner logs:  ${YELLOW}docker compose -f docker-compose-scanner.yml logs${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "✗ Analysis Failed${NC}"
    echo "=========================================="
    echo ""
    echo "Common issues:"
    echo "1. Token is invalid - regenerate in SonarQube UI"
    echo "2. Project key contains invalid characters"
    echo "3. Server is not fully started - wait and retry"
    echo ""
    echo "View logs for more details:"
    echo -e "${YELLOW}  docker compose -f docker-compose-scanner.yml logs${NC}"
    echo ""
    exit 1
fi