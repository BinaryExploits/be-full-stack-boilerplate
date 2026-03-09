#!/usr/bin/env bash
set -euo pipefail

# Check and update Route 53 A record for this instance (always run from deploy; skip only when not on EC2 or missing data).
# Uses R53_HOSTED_ZONE_ID and ROUTE53_DOMAIN_SUFFIX (set in go.sh or by Terraform), RECORD_NAME (<repo-name>.<your-domain>).
# Optional: PUBLIC_IP (default: from instance metadata). IAM: route53:ChangeResourceRecordSets, route53:ListResourceRecordSets.

log() {
  printf "\n[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

if [[ -z "${R53_HOSTED_ZONE_ID:-}" ]]; then
  log "R53_HOSTED_ZONE_ID not set; skip Route 53."
  exit 0
fi

if [[ -z "${RECORD_NAME:-}" ]]; then
  log "RECORD_NAME not set; skip Route 53."
  exit 0
fi

# Ensure record name is FQDN (Route 53 expects trailing dot for FQDN in change batch)
RECORD_NAME="${RECORD_NAME%.}"

# Get public IP (env, then IMDSv2, then IMDSv1, then EC2 describe-instances).
get_public_ip() {
  if [[ -n "${PUBLIC_IP:-}" ]]; then
    echo "${PUBLIC_IP}"
    return
  fi
  local meta="http://169.254.169.254"
  local token
  token="$(curl -sS -X PUT "${meta}/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60" --connect-timeout 2 2>/dev/null)" || true
  if [[ -n "${token}" ]]; then
    curl -sS -H "X-aws-ec2-metadata-token: ${token}" \
      --connect-timeout 2 "${meta}/latest/meta-data/public-ipv4" 2>/dev/null
  else
    curl -sS --connect-timeout 2 "${meta}/latest/meta-data/public-ipv4" 2>/dev/null
  fi
}

ip="$(get_public_ip)"
if [[ -z "${ip}" || "${ip}" == *"<?xml"* ]]; then
  # Fallback: get instance ID from metadata, then describe-instances for PublicIpAddress
  token="$(curl -sS -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60" --connect-timeout 2 2>/dev/null)" || true
  iid=""
  if [[ -n "${token}" ]]; then
    iid="$(curl -sS -H "X-aws-ec2-metadata-token: ${token}" --connect-timeout 2 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)"
  else
    iid="$(curl -sS --connect-timeout 2 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)"
  fi
  if [[ -n "${iid}" && "${iid}" != *"<?xml"* ]]; then
    ip="$(aws ec2 describe-instances --instance-ids "${iid}" \
      --query 'Reservations[0].Instances[0].PublicIpAddress' --output text 2>/dev/null)" || true
  fi
fi

if [[ -z "${ip}" || "${ip}" == "None" ]]; then
  log "No public IP (not on EC2, metadata unavailable, or missing EIP). Run elastic-ip.sh first."
  exit 1
fi

# Refuse to point Route 53 at an ephemeral IP when PUBLIC_IP was not set by elastic-ip.sh
if [[ -z "${PUBLIC_IP:-}" ]]; then
  eip_alloc="$(aws ec2 describe-addresses --public-ips "${ip}" --query 'Addresses[0].AllocationId' --output text 2>/dev/null)" || true
  if [[ -z "${eip_alloc}" || "${eip_alloc}" == "None" ]]; then
    log "Instance has no Elastic IP; refusing to point Route 53 at ephemeral IP ${ip}. Run elastic-ip.sh first (e.g. re-run deploy after manually attaching an EIP in the console)."
    exit 1
  fi
fi

# UPSERT: create or update
log "Route 53: UPSERT ${RECORD_NAME} -> ${ip}"

batch="$(mktemp)"
cat <<EOF > "${batch}"
{
  "Comment": "EC2 deploy A record",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "${RECORD_NAME}.",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "${ip}"}]
    }
  }]
}
EOF

if ! aws route53 change-resource-record-sets \
  --hosted-zone-id "${R53_HOSTED_ZONE_ID}" \
  --change-batch "file://${batch}"; then
  rm -f "${batch}"
  echo "Route 53 update failed. Check IAM and hosted zone ID." >&2
  exit 1
fi

rm -f "${batch}"
log "Route 53 updated: ${RECORD_NAME} -> ${ip}"
