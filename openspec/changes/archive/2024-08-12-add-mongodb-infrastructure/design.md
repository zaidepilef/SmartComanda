## Context

See proposal.md - Why for motivation. Current state detected in the repository (as of this change):

- **Backend** (`backend/`): Express 5, ESM (`"type": "module"`), single file `src/server.js` with two endpoints (`GET /` status, JSON parsing, CORS). `dotenv` and `pg` are already dependencies; there is NO database connection layer, no config module, no test framework, and no business logic yet — so MongoDB integration is purely additive.
- **Docker Compose** (`docker-compose.yml`): existing services `postgres`, `pgadmin`, `api`, `n8n`, `angular_admin`; named volume + network conventions (`smartcomanda_postgres_data`, `smartcomanda_network`); `api` receives env vars directly and depends on a healthy `postgres`. Postgres is the current primary database (`postgres/init.sql` exists).
- **Security finding (conflict with the request)**: the repository root has NO `.gitignore` and the real `.env` (with `POSTGRES_PASSWORD`, `JWT_SECRET`, etc.) **is tracked in Git**. The request requires that MongoDB credentials never appear in Git and that `.env` be ignored — so untracking `.env` and adding a root `.gitignore` is included in this change as a security fix. Additionally, `docker-compose.yml` contains a hardcoded `DB_POSTGRESDB_PASSWORD: admin123` for n8n; it is outside this change's scope (flagged, not fixed).
- **Conventions**: archived OpenSpec changes show proposal/design/tasks in English; docker-compose uses explicit named volumes, `${VAR}` interpolation from root `.env`, and `condition: service_healthy` dependency chaining.

## Goals / Non-Goals

**Goals:**
- Add `mongodb` (official `mongo:8` image) as a Docker Compose service following the existing network/volume/healthcheck conventions.
- Add a small config + connection layer in the backend and a `/health` endpoint reporting database state; fail fast on startup when unreachable.
- One env var (`MONGODB_URI`) switches the app between local and Atlas without code changes.
- Shell scripts for start/stop/status and mongodump/mongorestore backups in both directions (LOCAL ⇄ backup ⇄ ATLAS).
- Security hardening: root `.gitignore` + untrack `.env` + `.env.example` with placeholders; local port bound to localhost only.
- Docs in README covering local setup, Atlas setup, backup/restore runbooks.
- Test scripts covering the 9 acceptance scenarios (local start, persistence, connectivity, health, CRUD round-trip, dump/restore, URI switching, credentials absent from Git).

**Non-Goals:**
- No bidirectional automatic replication/sync between local and Atlas (backup/restore only, per request).
- No mongoose/ORM layer, no data models, no business functionality; no schema changes.
- No migration of existing Postgres data; Postgres services keep working unchanged (Postgres remains the current primary database of the existing features).
- No provisioning/automation of Atlas clusters (manual creation documented).
- No CI pipeline for these tests in this change.

## Decisions

1. **Official `mongo:8` image with `mongosh` healthcheck.** Use the default `mongo:8` image (not alpine) for maximum compatibility with the MongoDB tooling inside the container. Healthcheck via: `mongosh --quiet --eval "db.runCommand({ ping: 1 })"` (the legacy `mongo` shell no longer ships with MongoDB ≥ 6; `mongosh` is the official client).

2. **`MONGODB_URI` as the single runtime switch.** The `.env.example` documents three forms: `mongodb://mongodb:27017/smartcomanda` (inside the Docker network), `mongodb://localhost:27017/smartcomanda` (backend run on host / Compass), and `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>` (Atlas). In `docker-compose.yml` the `api` service overrides with the internal URI (a non-secret default) so the container always reaches the `mongodb` service over the Docker network; the host-side value in `.env` is used by Compass and by host-run scripts. The backend reads `MONGODB_URI` with fallback to `mongodb://localhost:27017/smartcomanda` for bare `npm run dev` on the host.

3. **Atlas URI kept apart: `ATLAS_MONGODB_URI`.** Backups against Atlas must never clobber the runtime URI, and credentials must stay out of Git: scripts read a separate optional seed URI `ATLAS_MONGODB_URI` (documented in `.env.example`, only placeholders committed). The app code never reads it — it exists to drive the backup/restore scripts.

4. **Official `mongodb` Node driver (no mongoose).** Rationale: the backend has no models yet; the driver is enough to connect, ping, and test document CRUD. Mongoose would introduce schema coupling prematurely. Alternatives considered: mongoose (rejected — adds abstraction without business models), Prisma for Mongo (rejected — too heavy, no schema to model).

5. **Fail-fast startup + liveness health check.** On boot, connect with `serverSelectionTimeoutMS: 5000`; on failure log a clear error and `process.exit(1)` (never serve "half-degraded" API). Keep state in the connection module; listen to driver server events (`'close'`/`'error'`) to update a live state used by `GET /health` → 200 `{ status: "ok", database: "connected" }`, or 503 `{ status: "degraded", database: "disconnected" }` when the connection drops at runtime. The route runs a `ping` command with timeout so the check reflects reality, not a cached flag.

6. **Backup/restore via Docker tooling only (KISS, no host installs).**
   - Local ⇄ backup: `docker compose exec mongodb mongodump --uri "mongodb://localhost:27017" --archive:/backups/... --db smartcomanda` (tools ship inside the image; the `./backups:/backups` host bind mount exposes the archives to the container).
   - Atlas ⇄ backup: one-off container `docker run --rm -v "$PWD/backups:/backups" mongo:8 mongodump --uri "$ATLAS_MONGODB_URI" --archive:/backups/atlas-<date>.archive` (and the mirror `mongorestore`), so credentials never touch the host shell history and work on any machine.
   - Restores require an explicit confirmation step (prompt `--yes`/`--force`) and are clearly marked DESTRUCTIVE in help text.
   - Alternatives considered: host-installed mongodump (rejected — extra dependency, version drift); `mongosh`-based export (rejected — dump archive is the restore target); a fifth tool like `mongoexport` (rejected — per-collection, loses metadata).

7. **Backup artifacts live in `backups/` at the repo root, gitignored** (timestamped `.archive` files, e.g. `smartcomanda-local-2026-08-08T10-00-00.archive`). Recovery source for restore scripts defaults to the newest artifact unless overridden.

8. **Compose service shape** — following the existing patterns (not the project, verified against `postgres`):

   ```yaml
   mongodb:
     image: mongo:8
     container_name: smartcomanda_mongodb
     restart: unless-stopped
     ports:
       - "127.0.0.1:${MONGODB_PORT:-27017}:27017"   # localhost-only binding
     volumes:
       - smartcomanda_mongodb_data:/data/db
       - ./backups:/backups
     healthcheck:
       test: ["CMD-SHELL", "mongosh --quiet --eval 'db.runCommand({ ping: 1 })' || exit 1"]
       interval: 5s
       timeout: 5s
       retries: 10
     networks:
       - smartcomanda_network
   ```
   with `smartcomanda_mongodb_data` added to the top-level `volumes:` block, per existing naming convention.

9. **Backend structure added** (no restructuring of existing code, only new small files, per AGENTS.md layering):

   ```
   backend/src/
   ├── config/env.js        # dotenv + MONGODB_URI default
   ├── db/mongo.js          # connectMongo(), isMongoConnected(), close() logic
   ├── routes/health.js     # GET /health
   └── server.js            # (modified) init db, mount /health
   ```
   `server.js` currently handles listen — it gains a startup sequence: load config → connect db → start listen; and graceful shutdown (SIGTERM/SIGINT → close db → exit). No business route touched.

10. **Testing with zero new deps:** Node's built-in test runner (`node --test`, ESM-friendly) for unit tests (config resolution, health route responses with a mocked/fake connection state) and integration scripts under `scripts/test/` (docker start/healthy, volume persistence across restart, backend connect, `/health` result, insert→find round-trip via `mongosh`, dump→restore round-trip, `.env` absent from `git ls-files`, and Atlas-only switch documented as a **manual** test since no real Atlas credentials can live in the repo).

## Risks / Trade-offs

- **[Real credentials historically exposed in Git]** → Immediate mitigation in this change: root `.gitignore`, `git rm --cached .env`, rotate the secrets in `.env` after the change archives (values are already in git history; recommend rotating `JWT_SECRET`, Postgres/Atlas passwords).
- **[Destructive restores]** → Scripts require explicit confirmation, print the target + source, and write `.archive` backups before overwriting the local DB; the draft docs label all restore commands DESTRUCTIVE.
- **[Port 27017 conflicts on host]** → `MONGODB_PORT` env override; host binding is `127.0.0.1` to keep the DB out of the LAN.
- **[mongosh/mongo version drift in healthcheck]** → Same image (`mongo:8`) runs both tools and the healthcheck in one container; docs pin the image tag.
- **[Atlas network access / IP allowlist]** → README documents creating a database user and opening IPv6/IP allowlist; `localhost` recommended for dev only; production notes warn against `0.0.0.0/0`.
- **[Dump drives "sync" expectations]** → README stresses this is NOT sync/replication; directions are one-way with timestamps; recommends backing up before any restore.
- **[Backend weakly coupled to Postgres vs MongoDB]** → Today both exist; nothing in this change makes Mongo authoritative for the existing features (Postgres remains the current DB of those services); a future change must decide ownership.

## Migration Plan

1. Apply the security fix first: add `.gitignore`, `git rm --cached .env`, commit `.env.example`.
2. Add `mongodb` service to `docker-compose.yml`, add volume, `docker compose up -d mongodb` — existing services untouched.
3. Backend: add `mongodb` dependency, new modules, health route, npm scripts; restart the `api` container.
4. Verify with the test suite (local + dump/restore smoke).
5. Manual verification for Atlas is documented but executed by the developer with their own credentials.

Rollback: removing the `mongodb` service and env wiring restores the previous state; data keeps its volume and dumps are in `backups/` (gitignored).

## Open Questions

- Which database (Postgres vs MongoDB) becomes the primary store for future business features is a strategic decision outside this change; here MongoDB is merely an additional, isolated infrastructure piece.
- Naming of the MongoDB database (`smartcomanda` used as default) and Atlas cluster/db names can be finalized without changing specs, tasks, or approach.