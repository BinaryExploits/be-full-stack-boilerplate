#!/usr/bin/env bash
set -euo pipefail

# Ensures this EC2 instance has exactly one EIP behavior:
# - If an EIP is already associated to this instance: exit (no changes).
# - Else if current public IP is an EIP in your account: exit (no changes).
# - Else: allocate a new EIP and associate it to this instance.
#
# Requirements:
# - AWS CLI installed and configured (instance profile IAM role recommended)
# - IAM permissions: ec2:DescribeInstances, ec2:DescribeAddresses,
#   ec2:AllocateAddress, ec2:AssociateAddress, (optional) ec2:CreateTags
#
# Optional env vars:
#   TAG_EIP_NAME="my-eip-name"   # adds a Name tag to the allocated EIP

IMDS_TIMEOUT="${IMDS_TIMEOUT:-2}"

log() {
  printf "[%s] %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" >&2
}

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1" >&2; exit 1; }
}

# --- IMDSv2 helpers ---
imds_token() {
  curl -sS -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" \
    --connect-timeout "${IMDS_TIMEOUT}"
}

imds_get() {
  local path="$1"
  curl -sS -H "X-aws-ec2-metadata-token: ${IMDS_TOKEN}" \
    --connect-timeout "${IMDS_TIMEOUT}" \
    "http://169.254.169.254/latest/${path}"
}

need curl
need aws

IMDS_TOKEN="$(imds_token)" || true
if [[ -z "${IMDS_TOKEN}" ]]; then
  log "IMDS token unavailable; cannot determine instance metadata."
  exit 0
fi

INSTANCE_ID="$(imds_get meta-data/instance-id 2>/dev/null || true)"
AZ="$(imds_get meta-data/placement/availability-zone 2>/dev/null || true)"
if [[ -z "${INSTANCE_ID}" || -z "${AZ}" ]]; then
  log "Metadata unavailable; skip Elastic IP."
  exit 0
fi
REGION="${AZ::-1}"

log "InstanceId: ${INSTANCE_ID}"
log "Region:     ${REGION}"

# Guard 1: if ANY Elastic IP is already associated to this instance, do nothing.
EXISTING_EIP_ALLOC_ID="$(aws ec2 describe-addresses \
  --region "${REGION}" \
  --filters "Name=instance-id,Values=${INSTANCE_ID}" \
  --query "Addresses[0].AllocationId" \
  --output text 2>/dev/null || true)"
[[ "${EXISTING_EIP_ALLOC_ID}" == "None" ]] && EXISTING_EIP_ALLOC_ID=""

if [[ -n "${EXISTING_EIP_ALLOC_ID}" ]]; then
  EXISTING_EIP_PUBLIC_IP="$(aws ec2 describe-addresses \
    --region "${REGION}" \
    --allocation-ids "${EXISTING_EIP_ALLOC_ID}" \
    --query "Addresses[0].PublicIp" \
    --output text)"
  log "EIP already associated to this instance: ${EXISTING_EIP_PUBLIC_IP} (AllocationId: ${EXISTING_EIP_ALLOC_ID}). Nothing to do."
  echo "${EXISTING_EIP_PUBLIC_IP}"
  exit 0
fi

# Current public IPv4 (if any)
PUBLIC_IP="$(imds_get meta-data/public-ipv4 2>/dev/null || true)"
if [[ -z "${PUBLIC_IP}" ]]; then
  log "No public IPv4 currently assigned. Will allocate + associate an Elastic IP."
else
  log "Current public IPv4: ${PUBLIC_IP}"
fi

# Guard 2: if current public IP is an EIP in your account, do nothing.
ALLOCATION_ID=""
if [[ -n "${PUBLIC_IP}" ]]; then
  ALLOCATION_ID="$(aws ec2 describe-addresses \
    --region "${REGION}" \
    --filters "Name=public-ip,Values=${PUBLIC_IP}" \
    --query "Addresses[0].AllocationId" \
    --output text 2>/dev/null || true)"
  [[ "${ALLOCATION_ID}" == "None" ]] && ALLOCATION_ID=""
fi

if [[ -n "${ALLOCATION_ID}" ]]; then
  log "Current public IP is an Elastic IP in this account (AllocationId: ${ALLOCATION_ID}). Nothing to do."
  echo "${PUBLIC_IP}"
  exit 0
fi

# Allocate a new EIP
log "Allocating a new Elastic IP..."
NEW_ALLOC_ID="$(aws ec2 allocate-address --region "${REGION}" --domain vpc --query "AllocationId" --output text)"
NEW_PUBLIC_IP="$(aws ec2 describe-addresses --region "${REGION}" --allocation-ids "${NEW_ALLOC_ID}" \
  --query "Addresses[0].PublicIp" --output text)"

log "Allocated EIP: ${NEW_PUBLIC_IP} (AllocationId: ${NEW_ALLOC_ID})"


# Associate EIP to this instance
log "Associating EIP to instance..."
ASSOC_ID="$(aws ec2 associate-address \
  --region "${REGION}" \
  --allocation-id "${NEW_ALLOC_ID}" \
  --instance-id "${INSTANCE_ID}" \
  --query "AssociationId" \
  --output text)"

log "Associated. AssociationId: ${ASSOC_ID}"
log "Done. Elastic IP: ${NEW_PUBLIC_IP}"
echo "${NEW_PUBLIC_IP}"
