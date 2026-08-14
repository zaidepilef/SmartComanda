#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "Stopping MongoDB service (data volume persists)..."
docker compose stop mongodb
echo "MongoDB stopped."
