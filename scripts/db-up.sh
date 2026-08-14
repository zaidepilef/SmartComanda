#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env

echo "Starting MongoDB service..."
docker compose up -d mongodb
docker compose exec -T mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" >/dev/null
echo "MongoDB is healthy and reachable."
