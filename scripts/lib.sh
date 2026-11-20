#!/usr/bin/env bash
# Shared helpers for SmartComanda PostgreSQL scripts.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

BACKUP_DIR="$REPO_ROOT/backups"

# Load .env safely (only KEY=VALUE lines, no shell evaluation).
load_env() {
  local env_file="$REPO_ROOT/.env"
  [[ -f "$env_file" ]] || return 0
  while IFS='=' read -r key value; do
    [[ -z "$key" ]] && continue
    [[ "$key" =~ ^# ]] && continue
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    export "$key=$value"
  done < "$env_file"
}

timestamp() {
  date +%Y-%m-%dT%H-%M-%S
}

# Confirmation prompt for destructive operations.
# Set FORCE=1 (or pass --yes/--force) to skip the prompt.
confirm_destructive() {
  local target="$1"
  local answer
  if [[ "${FORCE:-}" == "1" ]]; then
    echo "DESTRUCTIVE operation forced (--yes/--force): $target"
    return 0
  fi
  echo "WARNING: this operation is DESTRUCTIVE and will overwrite data in: $target"
  read -r -p "Type 'yes' to continue: " answer
  [[ "$answer" == "yes" ]]
}

require_env() {
  local var="$1"
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: $var is not set. Add it to $REPO_ROOT/.env" >&2
    exit 1
  fi
}

latest_archive() {
  local pattern="$1"
  ls -1t "$BACKUP_DIR"/$pattern 2>/dev/null | head -n1 || true
}
