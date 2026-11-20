#!/usr/bin/env bash
# Restore a dump into the application PostgreSQL database.
# Usage: db-restore.sh [--yes|--force] [file-relative-to-backups/]
# Without a file, restores the most recent dump. DESTRUCTIVE: drops existing objects first.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

file=""
for arg in "$@"; do
  case "$arg" in
    --yes|--force) FORCE=1 ;;
    *) file="$arg" ;;
  esac
done

load_env
require_env POSTGRES_USER
require_env POSTGRES_DB

if [[ -n "$file" ]]; then
  dump="$BACKUP_DIR/$file"
else
  dump="$(latest_archive "$POSTGRES_DB-*.dump")"
fi

if [[ -z "$dump" || ! -f "$dump" ]]; then
  echo "ERROR: no dump found in $BACKUP_DIR" >&2
  exit 1
fi

if [[ ! -s "$dump" ]]; then
  echo "ERROR: dump is empty: $dump" >&2
  exit 1
fi

confirm_destructive "PostgreSQL database '$POSTGRES_DB'" || { echo "Aborted."; exit 1; }

echo "Restoring $dump into $POSTGRES_DB..."
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --clean --if-exists --no-owner < "$dump"

echo "Restore completed."
