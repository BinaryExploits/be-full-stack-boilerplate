#!/usr/bin/env bash
set -euo pipefail

# Pull (fetch, checkout, pull) the repo. Clone is done by bootstrap/go.sh when repo doesn't exist.
# Uses REPO_URL, BRANCH (default main), GITHUB_TOKEN (for HTTPS).

log() {
  printf "\n[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need_cmd git
need_cmd base64

if [[ -z "${REPO_URL:-}" ]]; then
  echo "Missing REPO_URL." >&2
  exit 1
fi

BRANCH="${BRANCH:-main}"
TARGET_DIR="${TARGET_DIR:-$(pwd)}"

if [[ ! -d "${TARGET_DIR}/.git" ]]; then
  log "Not a git repo (no .git). Clone is done by bootstrap/go.sh on first run."
  exit 0
fi

log "Updating repo in ${TARGET_DIR} (branch: ${BRANCH})"

if [[ "${REPO_URL}" == git@* || "${REPO_URL}" == ssh://* ]]; then
  git -C "${TARGET_DIR}" remote set-url origin "${REPO_URL}"
  git -C "${TARGET_DIR}" fetch --prune origin
  git -C "${TARGET_DIR}" checkout "${BRANCH}"
  git -C "${TARGET_DIR}" pull --ff-only origin "${BRANCH}"
else
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "HTTPS pull requires GITHUB_TOKEN." >&2
    exit 1
  fi
  auth="$(printf "x-access-token:%s" "${GITHUB_TOKEN}" | base64 | tr -d '\n')"
  git -C "${TARGET_DIR}" remote set-url origin "${REPO_URL}"
  git -c "http.extraHeader=Authorization: Basic ${auth}" -C "${TARGET_DIR}" fetch --prune origin
  git -C "${TARGET_DIR}" checkout "${BRANCH}"
  git -c "http.extraHeader=Authorization: Basic ${auth}" -C "${TARGET_DIR}" pull --ff-only origin "${BRANCH}"
fi

log "Repo ready: ${TARGET_DIR}"
