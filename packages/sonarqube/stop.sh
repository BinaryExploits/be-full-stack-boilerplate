#!/bin/bash
# SonarQube Stop Script for macOS — gracefully stops running containers

set -e

# Colors
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
RESET="\033[0m"

echo -e "${BLUE}==========================================${RESET}"
echo -e "${BLUE}Stopping SonarQube containers...${RESET}"
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
SONARQUBE_PORT_HOST=${SONARQUBE_PORT_HOST:-9000}
POSTGRES_PORT_HOST=${POSTGRES_PORT_HOST:-5432}

# Step 1: Stop main docker-compose stack
echo -e "${YELLOW}[STEP 1] Stopping main containers...${RESET}"
docker compose stop || true

# Step 2: Stop any scanner-related stack
echo -e "${YELLOW}[STEP 2] Stopping scanner containers (if any)...${RESET}"
docker compose -f docker-compose-scanner.yml stop >/dev/null 2>&1 || true
docker stop $SCANNER_CONTAINER_NAME >/dev/null 2>&1 || true

# Step 3: Verify containers are stopped
echo -e "${YELLOW}[STEP 3] Verifying container shutdown...${RESET}"
if docker ps | grep -qE "$SONAR_CONTAINER_NAME|$POSTGRES_CONTAINER_NAME|$SCANNER_CONTAINER_NAME"; then
    echo -e "${RED}Some containers still running. Forcing shutdown...${RESET}"
    docker stop $SONAR_CONTAINER_NAME $POSTGRES_CONTAINER_NAME $SCANNER_CONTAINER_NAME >/dev/null 2>&1 || true
else
    echo -e "${GREEN}All containers stopped successfully.${RESET}"
fi

# Step 4: Check for leaked SonarQube or Postgres processes
echo -e "${YELLOW}[STEP 4] Checking for leftover processes...${RESET}"
SONAR_PROCS=$(pgrep -f sonar || true)
if [ -n "$SONAR_PROCS" ]; then
    echo -e "${RED}Found active SonarQube processes. Terminating...${RESET}"
    kill -9 $SONAR_PROCS || true
else
    echo -e "${GREEN}No residual SonarQube processes detected.${RESET}"
fi

echo -e "\n${GREEN}All SonarQube containers stopped cleanly.${RESET}"

# Step 5: Check for processes occupying SonarQube or Postgres ports
echo -e "${YELLOW}[STEP 5] Checking for active processes on SonarQube/Postgres ports...${RESET}"

for PORT in $SONARQUBE_PORT_HOST $POSTGRES_PORT_HOST; do
    echo -e "${BLUE}Checking port $PORT...${RESET}"
    PIDS=$(sudo lsof -ti :$PORT || true)
    if [ -n "$PIDS" ]; then
        echo -e "${RED}Port $PORT is still in use by process(es): $PIDS${RESET}"
        echo -e "${YELLOW}Killing processes on port $PORT...${RESET}"
        sudo kill -9 $PIDS || true
        echo -e "${GREEN}Cleared port $PORT successfully.${RESET}"
    else
        echo -e "${GREEN}No processes found on port $PORT.${RESET}"
    fi
done
