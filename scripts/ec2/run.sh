#!/usr/bin/env bash
set -euo pipefail

# Orchestrator: install deps, sync repo, Route 53 A record (check and update), stack.
# Called by bootstrap/go.sh after clone (or when repo already exists).
# All env (REPO_URL, BRANCH, TARGET_DIR, etc.) should be set by go.sh or caller.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Ensure we're in repo root (go.sh already cd'd here; support direct invocation too)
cd "${REPO_ROOT}"
export TARGET_DIR="${TARGET_DIR:-${REPO_ROOT}}"
export BRANCH="${BRANCH:-main}"
export REPO_URL="${REPO_URL:-}"

# Defaults for deploy steps
export DOCKER_PRUNE="${DOCKER_PRUNE:-1}"
export PRUNE_UNTIL_HOURS="${PRUNE_UNTIL_HOURS:-168}"
export NO_CACHE_BUILD="${NO_CACHE_BUILD:-0}"
export RUN_MIGRATIONS="${RUN_MIGRATIONS:-0}"
export RUN_SEED="${RUN_SEED:-0}"
export COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
export API_ENV_FILE="${API_ENV_FILE:-${HOME:-/home/ec2-user}/.env.api.production}"
export WEB_ENV_FILE="${WEB_ENV_FILE:-${HOME:-/home/ec2-user}/.env.web.production}"
export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"
# Route 53: R53_HOSTED_ZONE_ID and ROUTE53_DOMAIN_SUFFIX are set by bootstrap/go.sh

# Parse args: full, migrate, seed, prune, no-prune, nocache, cache, or service names
SERVICES=()
FULL_DEPLOY=0
for arg in "$@"; do
  case "${arg}" in
    migrate) export RUN_MIGRATIONS=1 ;;
    seed) export RUN_SEED=1 ;;
    prune) export DOCKER_PRUNE=1 ;;
    no-prune) export DOCKER_PRUNE=0 ;;
    nocache) export NO_CACHE_BUILD=1 ;;
    cache) export NO_CACHE_BUILD=0 ;;
    full)
      FULL_DEPLOY=1
      export RUN_MIGRATIONS=1
      export RUN_SEED=1
      export DOCKER_PRUNE=1
      ;;
    *) SERVICES+=("${arg}") ;;
  esac
done
[[ "${FULL_DEPLOY}" == "1" ]] && SERVICES=()

# 1. Sync repo first so we run the latest scripts (including install-deps)
if [[ -n "${REPO_URL}" && -x "${SCRIPT_DIR}/repo-sync.sh" ]]; then
  pre_rev="$(git rev-parse HEAD 2>/dev/null || true)"
  export TARGET_DIR
  "${SCRIPT_DIR}/repo-sync.sh"
  post_rev="$(git rev-parse HEAD 2>/dev/null || true)"
  # If repo updated, re-exec the updated run.sh once so we don't keep running stale logic.
  if [[ -n "${pre_rev}" && -n "${post_rev}" && "${pre_rev}" != "${post_rev}" && -z "${RUN_SH_REEXEC:-}" ]]; then
    export RUN_SH_REEXEC=1
    exec "${SCRIPT_DIR}/run.sh" "$@"
  fi
fi

# 2. Install docker (and docker compose plugin) if missing
if [[ -x "${SCRIPT_DIR}/install-deps.sh" ]]; then
  "${SCRIPT_DIR}/install-deps.sh" || true
fi

# 3. Elastic IP and Route 53 (skip when Terraform manages them via TERRAFORM_MANAGED_EIP_R53=1)
if [[ -n "${TERRAFORM_MANAGED_EIP_R53:-}" ]]; then
  # Terraform already attached EIP and created the A record; set APP_DOMAIN for Caddy
  export RECORD_NAME="${RECORD_NAME:-}"
  export APP_DOMAIN="${APP_DOMAIN:-${RECORD_NAME}}"
elif [[ -n "${R53_HOSTED_ZONE_ID:-}" && -n "${REPO_URL:-}" ]]; then
  repo_name="$(basename "${REPO_URL}" .git)"
  export RECORD_NAME="${RECORD_NAME:-${repo_name}.${ROUTE53_DOMAIN_SUFFIX}}"
  export APP_DOMAIN="${APP_DOMAIN:-${RECORD_NAME}}"
  PUBLIC_IP=""
  if [[ -f "${SCRIPT_DIR}/elastic-ip.sh" ]]; then
    printf "\n[%s] Ensuring Elastic IP (existing or new)...\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >&2
    _eip_tmp="$(mktemp)"
    _eip_err="$(mktemp)"
    bash "${SCRIPT_DIR}/elastic-ip.sh" > "${_eip_tmp}" 2> "${_eip_err}" || true
    if [[ -s "${_eip_err}" ]]; then
      cat "${_eip_err}" >&2
    fi
    _raw="$(tail -n 1 "${_eip_tmp}" | tr -d '\r')"
    rm -f "${_eip_tmp}" "${_eip_err}"
    if [[ -n "${_raw}" && "${_raw}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      PUBLIC_IP="${_raw}"
      export PUBLIC_IP
    fi
  else
    echo "Missing elastic-ip.sh at ${SCRIPT_DIR}/elastic-ip.sh" >&2
    exit 1
  fi
  if [[ -z "${PUBLIC_IP:-}" ]]; then
    echo "Elastic IP required: elastic-ip.sh could not allocate or detect one. Check metadata and IAM (ec2:AllocateAddress, etc.)." >&2
    exit 1
  fi
  if [[ -x "${SCRIPT_DIR}/route53-update.sh" ]]; then
    "${SCRIPT_DIR}/route53-update.sh"
  fi
fi

# 4. Ensure production env files exist (copy from bootstrap samples if missing)
log_deploy() { printf "\n[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
DEFAULT_API_ENV="${API_ENV_FILE:-${HOME:-/home/ec2-user}/.env.api.production}"
DEFAULT_WEB_ENV="${WEB_ENV_FILE:-${HOME:-/home/ec2-user}/.env.web.production}"
for _role in api web; do
  if [[ "${_role}" == "api" ]]; then
    _dst="${DEFAULT_API_ENV}"
    _sample="${REPO_ROOT}/bootstrap/env.api.production.sample"
  else
    _dst="${DEFAULT_WEB_ENV}"
    _sample="${REPO_ROOT}/bootstrap/env.web.production.sample"
  fi
  if [[ ! -f "${_dst}" && -f "${_sample}" ]]; then
    cp "${_sample}" "${_dst}"
    log_deploy "Created ${_dst} from bootstrap sample; edit with real values."
  elif [[ ! -f "${_dst}" && ! -f "${_sample}" ]]; then
    log_deploy "Missing bootstrap sample: ${_sample}"
  fi
done

if [[ ! -f "${DEFAULT_API_ENV}" ]]; then
  echo "Missing ${DEFAULT_API_ENV}. Create it (or add bootstrap/env.api.production.sample and re-run)." >&2
  exit 1
fi

if [[ ! -f "${DEFAULT_WEB_ENV}" ]]; then
  echo "Missing ${DEFAULT_WEB_ENV}. Create it (or add bootstrap/env.web.production.sample and re-run)." >&2
  exit 1
fi

# 5. Deploy stack
"${SCRIPT_DIR}/stack.sh" "${SERVICES[@]}"
