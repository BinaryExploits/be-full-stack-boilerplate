#!/usr/bin/env bash
set -euo pipefail

# Install docker (and docker compose plugin) and AWS CLI on Amazon Linux 2 or 2023.
# Idempotent: no-op if docker and "docker compose" are already available.
# AWS CLI is needed for scripts/ec2/route53-update.sh.

log() {
  printf "\n[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

# AWS CLI (required for Route 53 step)
if ! command -v aws >/dev/null 2>&1; then
  log "Installing AWS CLI..."
  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y aws-cli
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y aws-cli
  fi
fi

if ! command -v nano >/dev/null 2>&1; then
  log "Installing nano..."
  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nano
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y nano
  fi
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  log "Docker and docker compose already installed"
  exit 0
fi

log "Installing docker..."

if command -v dnf >/dev/null 2>&1; then
  # Amazon Linux 2023
  sudo dnf install -y docker
  sudo systemctl start docker || true
  sudo systemctl enable docker || true
  if ! docker compose version >/dev/null 2>&1; then
    sudo dnf install -y docker-compose-plugin 2>/dev/null || true
  fi
elif command -v yum >/dev/null 2>&1; then
  # Amazon Linux 2
  if command -v amazon-linux-extras >/dev/null 2>&1; then
    sudo amazon-linux-extras install -y docker
  else
    sudo yum install -y docker
  fi
  sudo systemctl start docker || true
  sudo systemctl enable docker || true
  if ! docker compose version >/dev/null 2>&1; then
    sudo yum install -y docker-compose-plugin 2>/dev/null || true
  fi
else
  echo "Cannot install docker: no dnf or yum." >&2
  exit 1
fi

# If docker compose plugin still missing (e.g. AL2023 aarch64 has no package), install the binary from GitHub
if ! docker compose version >/dev/null 2>&1; then
  log "Installing Docker Compose plugin from GitHub (package not available for this arch)"
  COMPOSE_VERSION="v2.24.0"
  ARCH="$(uname -m)"
  PLUGIN_DIR="/usr/local/lib/docker/cli-plugins"
  sudo mkdir -p "${PLUGIN_DIR}"
  sudo curl -sSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${ARCH}" -o "${PLUGIN_DIR}/docker-compose"
  sudo chmod +x "${PLUGIN_DIR}/docker-compose"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin still not available. Install it manually and re-run." >&2
  exit 1
fi

# Add current user to docker group so we can run without sudo
if [[ -n "${SUDO_USER:-}" ]]; then
  sudo usermod -aG docker "${SUDO_USER}" 2>/dev/null || true
else
  sudo usermod -aG docker "${USER:-ec2-user}" 2>/dev/null || true
fi

log "Docker installed. You may need to run 'newgrp docker' or log out and back in to run docker without sudo."
