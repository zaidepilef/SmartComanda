#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env
mkdir -p "$BACKUP_DIR"
artifact="smartcomanda-local-$(timestamp).archive"

echo "Backing up local MongoDB (db: $DB_NAME)..."
docker compose exec -T mongodb mongodump \
  --uri "mongodb://localhost:27017" \
  --db "$DB_NAME" \
  --archive="/backups/$artifact"

echo "Backup created: $BACKUP_DIR/$artifact"
