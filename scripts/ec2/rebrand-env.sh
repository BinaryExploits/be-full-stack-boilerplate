#!/usr/bin/env bash
set -euo pipefail

# Rebrand bootstrap env samples: set domain, DB name, and generate new passwords.
# Reads bootstrap/env.api.production.sample and .env.web.production.sample,
# does in-place substitutions, and overwrites the same files.
#
# Usage: from repo root:
#   APP_DOMAIN=myapp.example.com ./scripts/ec2/rebrand-env.sh
#   REPO_URL=https://github.com/org/myapp.git ./scripts/ec2/rebrand-env.sh   # derives domain
#
# Env: APP_DOMAIN (or derived from REPO_URL + ROUTE53_DOMAIN_SUFFIX), APP_SLUG (optional, for DB name).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BOOTSTRAP="${REPO_ROOT}/bootstrap"
ROUTE53_DOMAIN_SUFFIX="${ROUTE53_DOMAIN_SUFFIX:-example.com}"

log() { printf "[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" >&2; }

# Derive APP_DOMAIN from REPO_URL if not set (e.g. myapp -> myapp.example.com)
if [[ -z "${APP_DOMAIN:-}" && -n "${REPO_URL:-}" ]]; then
  repo_basename="${REPO_URL}"
  repo_basename="${repo_basename%.git}"
  repo_basename="${repo_basename##*/}"
  APP_DOMAIN="${repo_basename}.${ROUTE53_DOMAIN_SUFFIX}"
  log "Derived APP_DOMAIN=${APP_DOMAIN} from REPO_URL"
fi

if [[ -z "${APP_DOMAIN:-}" ]]; then
  echo "Usage: APP_DOMAIN=myapp.example.com $0" >&2
  echo "   or: REPO_URL=https://github.com/org/repo.git $0" >&2
  exit 1
fi

# DB name: from APP_SLUG or strip first component of domain (e.g. myapp.example.com -> myapp -> myappdb)
if [[ -n "${APP_SLUG:-}" ]]; then
  DB_NAME="${APP_SLUG}db"
else
  DB_NAME="${APP_DOMAIN%%.*}"
  [[ -z "${DB_NAME}" ]] && DB_NAME="appdb"
  DB_NAME="${DB_NAME}db"
fi

# Generate new passwords (URL-safe base64, 24 bytes)
gen_pass() { openssl rand -base64 24 | tr -d '\n/+=' | head -c 32; }
POSTGRES_PASSWORD="$(gen_pass)"
MONGO_PASSWORD="$(gen_pass)"
REPLICA_KEY="$(gen_pass)"
BETTER_AUTH_SECRET="$(openssl rand -base64 32 | tr -d '\n' | head -c 48)"

log "Generated new passwords for Postgres, Mongo, replica set key, and BETTER_AUTH_SECRET"

# Escape for sed (use | as delimiter to avoid clashing with URLs)
domain_esc="${APP_DOMAIN//\//\\/}"
domain_esc="${domain_esc//|/\\|}"
db_esc="${DB_NAME//\//\\/}"
pg_esc="${POSTGRES_PASSWORD//\//\\/}"
pg_esc="${pg_esc//&/\\&}"
mongo_esc="${MONGO_PASSWORD//\//\\/}"
mongo_esc="${mongo_esc//&/\\&}"
replica_esc="${REPLICA_KEY//\//\\/}"
replica_esc="${replica_esc//&/\\&}"
auth_esc="${BETTER_AUTH_SECRET//\//\\/}"
auth_esc="${auth_esc//&/\\&}"

API_SAMPLE="${BOOTSTRAP}/env.api.production.sample"
WEB_SAMPLE="${BOOTSTRAP}/env.web.production.sample"

for f in "${API_SAMPLE}" "${WEB_SAMPLE}"; do
  if [[ ! -f "$f" ]]; then
    log "Missing $f; skip."
    exit 1
  fi
done

# API sample: substitute domain, DB name, and generated passwords (portable: no sed -i)
tmp_api="$(mktemp)"
cp "${API_SAMPLE}" "${tmp_api}"

apply_sed() {
  local f="$1"; shift
  local t="$(mktemp)"
  sed "$@" "$f" > "$t" && mv "$t" "$f"
}

# Domain-based
apply_sed "${tmp_api}" "s|https://your-app\.binaryexperiments\.com|https://${domain_esc}|g"
apply_sed "${tmp_api}" "s|your-app\.binaryexperiments\.com|${domain_esc}|g"

# DB name and Postgres password
apply_sed "${tmp_api}" "s|^POSTGRES_DB=.*|POSTGRES_DB=${DB_NAME}|"
apply_sed "${tmp_api}" "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|"
apply_sed "${tmp_api}" "s|postgresql://admin:change_me@postgres:5432/appdb|postgresql://admin:${pg_esc}@postgres:5432/${DB_NAME}|g"
apply_sed "${tmp_api}" "s|postgresql://admin:[^@]*@postgres:5432/[^[:space:]]*|postgresql://admin:${pg_esc}@postgres:5432/${DB_NAME}|g"

# Mongo passwords and BETTER_AUTH_SECRET
apply_sed "${tmp_api}" "s|^MONGO_INITDB_ROOT_PASSWORD=.*|MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}|"
apply_sed "${tmp_api}" "s|^MONGODB_PASSWORD=.*|MONGODB_PASSWORD=${MONGO_PASSWORD}|"
apply_sed "${tmp_api}" "s|^MONGODB_REPLICA_SET_KEY=.*|MONGODB_REPLICA_SET_KEY=${replica_esc}|"
apply_sed "${tmp_api}" "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=${auth_esc}|"
apply_sed "${tmp_api}" "s|mongodb://admin:[^@]*@mongo:27017/[^?]*|mongodb://admin:${mongo_esc}@mongo:27017/${DB_NAME}|g"

# Force placeholders for third-party secrets
apply_sed "${tmp_api}" 's|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=your_google_client_id_here|'
apply_sed "${tmp_api}" 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=your_google_client_secret_here|'
apply_sed "${tmp_api}" 's|^GOOGLE_CLOUD_PROJECT=.*|GOOGLE_CLOUD_PROJECT=your-project|'
apply_sed "${tmp_api}" 's|^GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=|'
apply_sed "${tmp_api}" 's|^ROLLBAR_ACCESS_TOKEN=.*|ROLLBAR_ACCESS_TOKEN=your_rollbar_token_here|'
apply_sed "${tmp_api}" 's|^RESEND_API_KEY=.*|RESEND_API_KEY=re_your_api_key_here|'
apply_sed "${tmp_api}" 's|^FIELD_ENCRYPTION_KEY=.*|FIELD_ENCRYPTION_KEY=your_64_char_hex_key_here|'

mv "${tmp_api}" "${API_SAMPLE}"
rm -f "${tmp_api}" 2>/dev/null || true

# Web sample: domain only
tmp_web="$(mktemp)"
cp "${WEB_SAMPLE}" "${tmp_web}"
apply_sed "${tmp_web}" "s|https://your-app\.binaryexperiments\.com|https://${domain_esc}|g"
apply_sed "${tmp_web}" "s|your-app\.binaryexperiments\.com|${domain_esc}|g"
mv "${tmp_web}" "${WEB_SAMPLE}"
rm -f "${tmp_web}" 2>/dev/null || true

log "Rebranded ${API_SAMPLE} and ${WEB_SAMPLE} (APP_DOMAIN=${APP_DOMAIN}, DB_NAME=${DB_NAME})"
