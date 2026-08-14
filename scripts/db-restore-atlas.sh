#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env
require_env ATLAS_MONGODB_URI

artifact="${1:-}"
[[ "${1:-}" == "--yes" || "${1:-}" == "--force" ]] && { FORCE=1; artifact="${2:-}"; }
if [[ -z "$artifact" ]]; then
  artifact="$(latest_archive 'smartcomanda-atlas-*.archive')"
fi
if [[ -z "$artifact" ]]; then
  echo "ERROR: no Atlas archive found. Pass one as argument." >&2
  exit 1
fi
if [[ ! -f "$BACKUP_DIR/$artifact" ]]; then
  echo "ERROR: archive not found: $BACKUP_DIR/$artifact" >&2
  exit 1
fi

confirm_destructive "MongoDB Atlas cluster (${ATLAS_MONGODB_URI%%@*}@<cluster>, restoring $artifact)" || { echo "Aborted."; exit 1; }

docker run --rm \
  -v "$BACKUP_DIR:/backups" \
  mongo:8 mongorestore \
  --uri "$ATLAS_MONGODB_URI" \
  --archive="/backups/$artifact" \
  --drop

echo "Restore complete: $BACKUP_DIR/$artifact"
