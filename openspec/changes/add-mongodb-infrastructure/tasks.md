## 1. Security hardening (do first)

- [ ] 1.1 Create root `.gitignore` covering `.env`, `backups/`, `node_modules/`, and OS/editor noise.
- [ ] 1.2 Untrack the existing `.env` (`git rm --cached .env`) without deleting it from disk.
- [ ] 1.3 Create root `.env.example` documenting `MONGODB_URI`, `MONGODB_PORT`, `ATLAS_MONGODB_URI` (placeholders only) plus the existing vars, and verify no real secret appears in any tracked file.

## 2. Docker Compose — MongoDB service

- [ ] 2.1 Add `mongodb` service (`mongo:8`) to `docker-compose.yml` on `smartcomanda_network` with `restart: unless-stopped` and named volume `smartcomanda_mongodb_data`.
- [ ] 2.2 Add host port binding `127.0.0.1:${MONGODB_PORT:-27017}:27017` and `./backups:/backups` volume mount.
- [ ] 2.3 Add `mongosh` healthcheck (ping command, 5s interval, 10 retries) and declare the volume in the top-level `volumes:` block per existing naming conventions.
- [ ] 2.4 Add `MONGODB_URI: mongodb://mongodb:27017/smartcomanda` to the `api` service environment; ensure existing services (postgres, pgadmin, n8n, angular_admin) are untouched.
- [ ] 2.5 Start the stack (`docker compose up -d mongodb`), verify the container reports healthy, and verify local data persists across a container restart.

## 3. Backend — config and connection

- [ ] 3.1 Add `mongodb` driver dependency to `backend/package.json` (official `mongodb` package).
- [ ] 3.2 Create `backend/src/config/env.js` loading `dotenv` and resolving `MONGODB_URI` (default `mongodb://localhost:27017/smartcomanda`).
- [ ] 3.3 Create `backend/src/db/mongo.js` with `connectMongo()` (timeout ~5s, fail fast `process.exit(1)` with a clear error), a live connection-state flag updated by driver `close`/`error` events, and `closeMongo()`.
- [ ] 3.4 Modify `backend/src/server.js` to run the startup sequence (config → connect DB → listen) and add SIGTERM/SIGINT graceful shutdown; keep existing routes intact.

## 4. Health check endpoint

- [ ] 4.1 Create `backend/src/routes/health.js` exposing `GET /health` returning 200 `{ status: "ok", database: "connected" }` when a `ping` succeeds and 503 `{ status: "degraded", database: "disconnected" }` otherwise (with ping timeout).
- [ ] 4.2 Mount the health route in `server.js` without affecting the existing `/` route.
- [ ] 4.3 Verify manually: `/health` returns 200 with MongoDB up, 503 after `docker compose stop mongodb`, and 200 again after restart.

## 5. Backup/restore scripts

- [ ] 5.1 Create `scripts/` helper utilities: loading `.env` if present, timestamped artifact naming, and a confirmation prompt for destructive commands.
- [ ] 5.2 Create `scripts/db-up.sh` and `scripts/db-down.sh` (start/stop the `mongodb` service via `docker compose`).
- [ ] 5.3 Create `scripts/db-status.sh` (container state, healthcheck result, and a connectivity ping from the host).
- [ ] 5.4 Create `scripts/db-backup-local.sh` using `docker compose exec mongodb mongodump --archive` to `./backups/smartcomanda-local-<timestamp>.archive`.
- [ ] 5.5 Create `scripts/db-restore-local.sh` (DESTRUCTIVE: confirmation required, `mongorestore --archive` from newest local archive or explicit path).
- [ ] 5.6 Create `scripts/db-backup-atlas.sh` and `scripts/db-restore-atlas.sh` using a one-off `mongo:8` container with `$ATLAS_MONGODB_URI` (no host installs, no committed credentials; restore requires confirmation).
- [ ] 5.7 Make all scripts executable and add corresponding `npm run` aliases in `backend/package.json` (`db:up`, `db:down`, `db:status`, `db:backup:local`, `db:restore:local`, `db:backup:atlas`, `db:restore:atlas`).
- [ ] 5.8 Smoke-test round trip: backup local → drop collection → restore → verify documents are back.

## 6. Documentation

- [ ] 6.1 Add README sections: prerequisites, local setup (`docker compose up`), connecting MongoDB Compass (local URI + Atlas URI), and env var reference.
- [ ] 6.2 Add the Atlas setup runbook: create free cluster, database user (placeholder credentials), Network Access (IP allowlist, `0.0.0.0/0` only for dev), and how to run the app against Atlas with `MONGODB_URI` only.
- [ ] 6.3 Add the backup/restore runbook: four directions, examples, and DESTRUCTIVE warnings (restore overwrites data; backups recommended before restore; this is not automatic sync/replication).

## 7. Tests

- [ ] 7.1 Unit tests with Node's built-in test runner (`node --test`): config resolution (default, env override) and health route behavior (connected vs degraded using a stubbed connection).
- [ ] 7.2 Create `scripts/test/` integration checks: mongodb service healthy; volume persistence across restart; backend connects and `/health` returns 200; `mongosh` insert→find round-trip; backup→restore round-trip; `.env` and `backups/` absent from `git ls-files`.
- [ ] 7.3 Document the manual Atlas acceptance test (same app connects to Atlas with only `MONGODB_URI` changed) in `.env.example`/README, since no real credentials can live in the repo.

## 8. Final verification

- [ ] 8.1 Run the full integration script suite and confirm all 9 acceptance criteria from the proposal (local start, volume persistence, backend connectivity, health reporting, CRUD round-trip, mongodump, mongorestore, Atlas switching via env only, no credentials in Git).
- [ ] 8.2 Confirm no business functionality changed (`git diff` shows only additive changes) and existing stack still boots with `docker compose up -d`.