#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env

artifact="${1:-}"
[[ "${1:-}" == "--yes" || "${1:-}" == "--force" ]] && { FORCE=1; artifact="${2:-}"; }
if [[ -z "$artifact" ]]; then
  artifact="$(latest_archive 'smartcomanda-local-*.archive')"
fi
if [[ -z "$artifact" ]]; then
  echo "ERROR: no local archive found. Pass one as argument." >&2
  exit 1
fi

if [[ "$artifact" == "$BACKUP_DIR/"* ]]; then
  artifact="${artifact#"$BACKUP_DIR/"}"
fi
if [[ ! -f "$BACKUP_DIR/$artifact" ]]; then
  echo "ERROR: archive not found: $BACKUP_DIR/$artifact" >&2
  exit 1
fi

confirm_destructive "local MongoDB database '$DB_NAME' (restoring $artifact)" || { echo "Aborted."; exit 1; }

docker compose exec -T mongodb mongorestore \
  --uri "mongodb://localhost:27017" \
  --archive="/backups/$artifact" \
  --drop

echo "Restore complete: $BACKUP_DIR/$artifact"
