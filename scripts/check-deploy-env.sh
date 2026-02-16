#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   scripts/check-deploy-env.sh                 # check current shell env
#   scripts/check-deploy-env.sh .env.local      # check values from env file

ENV_FILE="${1:-}"

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "ADMIN_SESSION_SECRET"
  "ADMIN_BOOTSTRAP_TOKEN"
)

OPTIONAL_VARS=(
  "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID"
)

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: env file not found: $ENV_FILE"
    exit 1
  fi

  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

missing=()

echo "Checking required deployment env vars..."
for key in "${REQUIRED_VARS[@]}"; do
  value="${!key-}"
  if [[ -z "${value// }" ]]; then
    missing+=("$key")
    echo "  - MISSING: $key"
  else
    echo "  - OK: $key"
  fi
done

echo
echo "Checking optional env vars..."
for key in "${OPTIONAL_VARS[@]}"; do
  value="${!key-}"
  if [[ -z "${value// }" ]]; then
    echo "  - OPTIONAL (not set): $key"
  else
    echo "  - OK: $key"
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo
  echo "Result: FAILED"
  echo "Missing required vars:"
  for key in "${missing[@]}"; do
    echo "  - $key"
  done
  exit 1
fi

echo
echo "Result: PASSED"
