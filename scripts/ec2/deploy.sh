#!/usr/bin/env bash
set -euo pipefail

# Run from inside repo: sync (pull) then run the docker stack.
# For first-run on EC2 use bootstrap/go.sh instead (only file to copy).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

export TARGET_DIR="${TARGET_DIR:-${REPO_ROOT}}"
export BRANCH="${BRANCH:-main}"
export COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

cd "${REPO_ROOT}"

if [[ -n "${REPO_URL:-}" && -x "${SCRIPT_DIR}/repo-sync.sh" ]]; then
  "${SCRIPT_DIR}/repo-sync.sh"
fi

exec "${SCRIPT_DIR}/stack.sh" "$@"
