#!/usr/bin/env bash
# Dump the application PostgreSQL database to backups/<db>-<timestamp>.dump
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env
require_env POSTGRES_USER
require_env POSTGRES_DB
mkdir -p "$BACKUP_DIR"
artifact="$POSTGRES_DB-$(timestamp).dump"

target="$BACKUP_DIR/$artifact"
partial="$target.partial"
# Never leave a truncated/empty dump behind: it would be picked as "latest" by db-restore.sh.
trap 'rm -f "$partial"' EXIT

echo "Backing up PostgreSQL (db: $POSTGRES_DB)..."
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$partial"

if [[ ! -s "$partial" ]]; then
  echo "ERROR: pg_dump produced an empty file; backup aborted." >&2
  exit 1
fi

mv "$partial" "$target"
echo "Backup created: $target"
