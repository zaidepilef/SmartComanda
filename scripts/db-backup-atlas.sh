#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env
require_env ATLAS_MONGODB_URI
mkdir -p "$BACKUP_DIR"
artifact="smartcomanda-atlas-$(timestamp).archive"

echo "Backing up MongoDB Atlas (${ATLAS_MONGODB_URI%%@*}@<cluster>)..."
docker run --rm \
  -v "$BACKUP_DIR:/backups" \
  mongo:8 mongodump \
  --uri "$ATLAS_MONGODB_URI" \
  --archive="/backups/$artifact"

echo "Backup created: $BACKUP_DIR/$artifact"
