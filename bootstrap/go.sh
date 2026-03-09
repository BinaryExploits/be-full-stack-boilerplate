#!/usr/bin/env bash
set -euo pipefail

# Minimal bootstrap for EC2: copy ONLY this file to the instance (e.g. ~/go.sh).
# Edit the block below ONCE when copying to EC2 so you don't have to export secrets every run.
# Sets up just enough to get the repo on the box, then hands off to scripts/ec2/run.sh.
#
# Usage: ./go.sh full   (or: ./go.sh web, ./go.sh api migrate seed, etc.)
# You can still override with env: REPO_URL="..." ./go.sh full

# === EDIT ONCE when copying this file to EC2 ===
REPO_URL="https://github.com/org/repo.git"   # your repo URL
GITHUB_TOKEN=""                              # GitHub PAT for private HTTPS clone (leave empty if using SSH URL)
BRANCH="main"                                # branch to deploy
# === END EDIT ===

if [[ "${DEBUG:-0}" == "1" ]]; then
  set -x
fi

usage() {
  cat <<'EOF'
Usage: ./go.sh [args...]

Edit REPO_URL, GITHUB_TOKEN, and BRANCH at the top of this script once (when copying to EC2).
Then run: ./go.sh full

Args are passed to scripts/ec2/run.sh (e.g. full, web, api, migrate, seed).
EOF
}

if [[ "$#" -eq 0 ]]; then
  usage
  exit 0
fi

if [[ -z "${REPO_URL}" ]]; then
  echo "Missing REPO_URL. Edit the REPO_URL line at the top of this script (or set REPO_URL=... when running)." >&2
  exit 1
fi

if [[ "${REPO_URL}" != git@* && "${REPO_URL}" != ssh://* && -z "${GITHUB_TOKEN}" ]]; then
  echo "HTTPS clone requires GITHUB_TOKEN. Edit the GITHUB_TOKEN line at the top of this script (or set GITHUB_TOKEN=... when running)." >&2
  exit 1
fi

# Derive TARGET_DIR from REPO_URL
repo_name="$(basename "${REPO_URL}")"
repo_name="${repo_name%.git}"
export TARGET_DIR="${HOME:-/home/ec2-user}/${repo_name}"

# Export so run.sh (and repo-sync) see them when we exec
export REPO_URL
export BRANCH
export GITHUB_TOKEN

# Route 53: binaryexperiments.com zone — set here so run.sh always has it
export R53_HOSTED_ZONE_ID="Z0760970XXLTORHSTKO2"
export ROUTE53_DOMAIN_SUFFIX="binaryexperiments.com"
# Optional: full record name (e.g. myapp.binaryexperiments.com). If empty, run.sh derives from repo URL.
export RECORD_NAME=""
# Set to 1 by Terraform user_data when EIP and Route 53 are managed by Terraform (run.sh skips elastic-ip.sh and route53-update.sh).
export TERRAFORM_MANAGED_EIP_R53=""

# ---- 1. Install git if missing (required to clone) ----
if ! command -v git >/dev/null 2>&1; then
  echo "Installing git..."
  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y git
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y git
  else
    echo "Cannot install git: no dnf or yum. Install git and re-run." >&2
    exit 1
  fi
fi

# ---- 2. Clone repo if not present ----
if [[ ! -d "${TARGET_DIR}/.git" ]]; then
  echo "Cloning ${REPO_URL} (branch: ${BRANCH}) into ${TARGET_DIR}"
  mkdir -p "$(dirname "${TARGET_DIR}")"
  if [[ "${REPO_URL}" == git@* || "${REPO_URL}" == ssh://* ]]; then
    git clone --branch "${BRANCH}" "${REPO_URL}" "${TARGET_DIR}"
  else
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
      echo "HTTPS clone requires GITHUB_TOKEN. Set it or use an SSH REPO_URL." >&2
      exit 1
    fi
    auth="$(printf "x-access-token:%s" "${GITHUB_TOKEN}" | base64 | tr -d '\n')"
    git -c "http.extraHeader=Authorization: Basic ${auth}" clone --branch "${BRANCH}" "${REPO_URL}" "${TARGET_DIR}"
  fi
fi

# ---- 3. Delegate to in-repo script ----
cd "${TARGET_DIR}"
if [[ ! -x "scripts/ec2/run.sh" ]]; then
  echo "Repo missing scripts/ec2/run.sh. Cannot continue." >&2
  exit 1
fi
exec scripts/ec2/run.sh "$@"
