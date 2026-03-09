#!/usr/bin/env bash
set -euo pipefail

# Build and run the production docker-compose stack.
# Assumes the repo already exists (go.sh clones; run.sh pulls).
# Usage: ./scripts/ec2/stack.sh [service...]   or with RUN_MIGRATIONS=1, RUN_SEED=1

TARGET_DIR="${TARGET_DIR:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
NO_CACHE_BUILD="${NO_CACHE_BUILD:-0}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-0}"
RUN_SEED="${RUN_SEED:-0}"
DOCKER_PRUNE="${DOCKER_PRUNE:-0}"
PRUNE_UNTIL_HOURS="${PRUNE_UNTIL_HOURS:-168}"
PRUNE_VOLUMES="${PRUNE_VOLUMES:-0}"

log() {
  printf "\n[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

docker_cmd() {
  if command -v sudo >/dev/null 2>&1 && [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    sudo -E env \
      API_ENV_FILE="${API_ENV_FILE:-}" \
      WEB_ENV_FILE="${WEB_ENV_FILE:-}" \
      APP_DOMAIN="${APP_DOMAIN:-}" \
      GOOGLE_APPLICATION_CREDENTIALS_FILE="${GOOGLE_APPLICATION_CREDENTIALS_FILE:-}" \
      DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-}" \
      docker "$@"
  else
    docker "$@"
  fi
}

docker_cleanup() {
  local until
  until="${PRUNE_UNTIL_HOURS}h"

  log "Docker disk usage (before prune)"
  docker_cmd system df || true

  log "Pruning stopped containers older than ${until}"
  docker_cmd container prune -f --filter "until=${until}" || true

  log "Pruning unused networks"
  docker_cmd network prune -f || true

  log "Pruning unused images older than ${until}"
  docker_cmd image prune -a -f --filter "until=${until}" || true

  log "Pruning build cache older than ${until}"
  docker_cmd builder prune -f --filter "until=${until}" || true

  if [[ "${PRUNE_VOLUMES}" == "1" ]]; then
    log "Pruning unused volumes (DANGEROUS: can delete DB data)"
    docker_cmd volume prune -f || true
  fi

  log "Docker disk usage (after prune)"
  docker_cmd system df || true
}

main() {
  need_cmd docker
  export API_ENV_FILE="${API_ENV_FILE:-${HOME:-/home/ec2-user}/.env.api.production}"
  export WEB_ENV_FILE="${WEB_ENV_FILE:-${HOME:-/home/ec2-user}/.env.web.production}"
  export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"

  docker_cmd compose version >/dev/null

  if [[ ! -d "${TARGET_DIR}" ]]; then
    echo "TARGET_DIR does not exist: ${TARGET_DIR}" >&2
    exit 1
  fi

  cd "${TARGET_DIR}"

  if [[ ! -f "${COMPOSE_FILE}" ]]; then
    echo "Compose file not found: ${TARGET_DIR}/${COMPOSE_FILE}" >&2
    exit 1
  fi

  # Load API env file so Docker Compose can substitute MONGODB_*, etc. (env_file: only feeds containers, not compose ${VAR})
  if [[ -r "${API_ENV_FILE}" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "${API_ENV_FILE}"
    set +a
  else
    log "Warning: API env file not readable (${API_ENV_FILE}); mongo and other services may fail if compose vars are unset"
  fi

  log "Deploying stack with ${COMPOSE_FILE}"

  local -a services=()
  if [[ "$#" -gt 0 ]]; then
    services=("$@")
    log "Targeted deploy: ${services[*]}"
  fi

  if [[ "${RUN_MIGRATIONS}" == "1" || "${RUN_SEED}" == "1" ]]; then
    if [[ "${NO_CACHE_BUILD}" == "1" ]]; then
      log "Pre-building api+migrate images with --no-cache (for migrate/seed)"
      docker_cmd compose -f "${COMPOSE_FILE}" build --no-cache api migrate
    else
      log "Pre-building api+migrate images (for migrate/seed)"
      docker_cmd compose -f "${COMPOSE_FILE}" build api migrate
    fi
  fi

  if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
    log "Running migrations (one-shot service: migrate)"
    docker_cmd compose -f "${COMPOSE_FILE}" up -d postgres mongo
    docker_cmd compose -f "${COMPOSE_FILE}" up --no-deps --abort-on-container-exit migrate
  fi

  if [[ "${RUN_SEED}" == "1" ]]; then
    log "Seeding databases (one-shot via api)"
    docker_cmd compose -f "${COMPOSE_FILE}" run --rm --no-deps api pnpm db:seed:all
  fi

  if [[ "${NO_CACHE_BUILD}" == "1" ]]; then
    log "Building with --no-cache"
    if [[ "${#services[@]}" -gt 0 ]]; then
      docker_cmd compose -f "${COMPOSE_FILE}" build --no-cache "${services[@]}"
    else
      docker_cmd compose -f "${COMPOSE_FILE}" build --no-cache
    fi
  fi

  if [[ "${#services[@]}" -gt 0 ]]; then
    docker_cmd compose -f "${COMPOSE_FILE}" up -d --no-deps --build "${services[@]}"
    docker_cmd compose -f "${COMPOSE_FILE}" ps "${services[@]}"
  else
    docker_cmd compose -f "${COMPOSE_FILE}" up -d --build
    docker_cmd compose -f "${COMPOSE_FILE}" ps
  fi

  if [[ "${DOCKER_PRUNE}" == "1" ]]; then
    docker_cleanup
  fi

  log "Done"
}

main "$@"
