#!/bin/bash
# SonarQube Cleanup Script for macOS — removes containers, volumes, and networks

set -e

# Colors
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
RESET="\033[0m"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo -e "${BLUE}==========================================${RESET}"
echo -e "${BLUE}Cleaning up SonarQube environment...${RESET}"
echo -e "${BLUE}==========================================${RESET}"

# Load .env if available
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

POSTGRES_CONTAINER_NAME=${POSTGRES_CONTAINER_NAME:-sonarqube-db}
SONAR_CONTAINER_NAME=${SONAR_CONTAINER_NAME:-sonarqube}
SCANNER_CONTAINER_NAME=${SCANNER_CONTAINER_NAME:-sonarqube-scanner}

# Step 1: Stop all containers
echo -e "${YELLOW}[STEP 1] Stopping containers...${RESET}"
docker compose down --remove-orphans || true
docker compose -f docker-compose-scanner.yml down --remove-orphans >/dev/null 2>&1 || true
docker stop $SONAR_CONTAINER_NAME $POSTGRES_CONTAINER_NAME $SCANNER_CONTAINER_NAME >/dev/null 2>&1 || true

# Step 2: Remove containers
echo -e "${YELLOW}[STEP 2] Removing leftover containers...${RESET}"
docker rm -f $SONAR_CONTAINER_NAME $POSTGRES_CONTAINER_NAME $SCANNER_CONTAINER_NAME >/dev/null 2>&1 || true

# Step 3: Remove SonarQube-related volumes
echo -e "${YELLOW}[STEP 3] Removing SonarQube volumes...${RESET}"
SONAR_VOLUMES=$(docker volume ls -q | grep -E "sonar|scanner" || true)
if [ -n "$SONAR_VOLUMES" ]; then
    echo -e "${BLUE}Found volumes:${RESET}"
    echo "$SONAR_VOLUMES"
    docker volume rm -f $SONAR_VOLUMES >/dev/null 2>&1 || true
else
    echo -e "${GREEN}No SonarQube volumes found.${RESET}"
fi

# Step 4: Prune unused Docker volumes
echo -e "${YELLOW}[STEP 4] Pruning unused Docker volumes...${RESET}"
docker volume prune -f >/dev/null 2>&1 || true

# Step 5: Remove unused networks
echo -e "${YELLOW}[STEP 5] Cleaning up Docker networks...${RESET}"
docker network prune -f >/dev/null 2>&1 || true

# Step 6: Remove dangling images
echo -e "${YELLOW}[STEP 6] Removing unused Docker images...${RESET}"
docker image prune -f >/dev/null 2>&1 || true

# Step 7: Verification
echo -e "\n${YELLOW}[STEP 7] Verification:${RESET}"

echo -e "${BLUE}Checking remaining containers...${RESET}"
if docker ps -a | grep -E "$SONAR_CONTAINER_NAME|$POSTGRES_CONTAINER_NAME|$SCANNER_CONTAINER_NAME" >/dev/null 2>&1; then
    docker ps -a | grep -E "$SONAR_CONTAINER_NAME|$POSTGRES_CONTAINER_NAME|$SCANNER_CONTAINER_NAME"
    echo -e "${RED}Some containers are still present.${RESET}"
else
    echo -e "${GREEN}No SonarQube containers found.${RESET}"
fi

echo -e "\n${BLUE}Checking remaining volumes...${RESET}"
if docker volume ls | grep -E "sonar|scanner" >/dev/null 2>&1; then
    docker volume ls | grep -E "sonar|scanner"
    echo -e "${RED}Some SonarQube volumes are still present.${RESET}"
else
    echo -e "${GREEN}No SonarQube volumes remain.${RESET}"
fi

echo -e "\n${GREEN}Cleanup complete. SonarQube environment reset successfully.${RESET}"