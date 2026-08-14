#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

load_env

echo "=== Container state ==="
docker inspect -f "state={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}" smartcomanda_mongodb 2>/dev/null || echo "container not found"

echo "=== docker compose ps ==="
docker compose ps mongodb

echo "=== Connectivity ping from host (inside container network) ==="
if docker compose exec -T mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" >/dev/null 2>&1; then
  echo "OK: mongodb reachable"
else
  echo "FAIL: mongodb NOT reachable"
  exit 1
fi
