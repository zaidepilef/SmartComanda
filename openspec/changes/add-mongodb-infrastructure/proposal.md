## Why

SmartComanda needs MongoDB as its primary data store, but today the repository has no MongoDB infrastructure at all: no Docker service, no backend connection layer, and no documented way to move between a local development database and a remote one. Teams must be able to develop locally with Docker, operate against MongoDB Atlas in remote environments, and move data in both directions with controlled backups — all without touching application code.

## What Changes

- Add a `mongodb` service (official MongoDB 8.x image) to the existing `docker-compose.yml`, integrated with the current network, healthcheck conventions and named volume pattern; exposing a configurable host port for MongoDB Compass.
- Add a minimal backend configuration and connection layer (no ORM, no unnecessary abstraction) so the Express API connects to MongoDB on startup, reports connection state via a health check endpoint, and fails clearly on connection errors.
- Introduce `MONGODB_URI` as the single environment variable controlling the database target: `mongodb://mongodb:27017/smartcomanda` (inside Docker), `mongodb://localhost:27017/smartcomanda` (outside Docker), or a `mongodb+srv://...` Atlas URI (remote).
- Document environment variables in a `.env.example` file at the repository root.
- **SECURITY FIX**: the repository root currently has NO `.gitignore` and the real `.env` (with credentials) is **tracked in Git**. This change adds a root `.gitignore` and removes `.env` from version control (`git rm --cached .env`), pairing with an `.env.example` carrying placeholders only.
- Add scripts (shell, invoked via npm scripts in `backend/package.json` or a `scripts/` directory) for: starting/stopping MongoDB infrastructure, checking MongoDB status, backing up the local MongoDB, restoring the local MongoDB, backing up Atlas, and restoring Atlas (mongodump/mongorestore only; no automatic bidirectional replication).
- Add clear documentation for local setup, Atlas configuration (network access, credentials via placeholders), and the backup/restore runbooks.

## Capabilities

### New Capabilities
- `mongodb-infrastructure`: MongoDB local service via Docker, backend connection and health check, environment-driven switching between local and Atlas via `MONGODB_URI`, and controlled `mongodump`/`mongorestore` backup/restore workflows.

### Modified Capabilities
- (none — the existing `development-environment-setup` spec describes Docker orchestration entry points; adding a database service does not change its requirements)

## Impact

- `docker-compose.yml` — new `mongodb` service integrated with the existing `smartcomanda_network`, new named volume, no changes to existing services.
- `backend/src/` — new `config/` and `db/` (or equivalent) modules; `server.js` gains MongoDB init and a health check endpoint.
- `backend/package.json` — new dependency (`mongodb` or `mongoose`); npm scripts for infra and backup/restore.
- Root — new `.gitignore`, new `.env.example`; existing `.env` updated with `MONGODB_URI` and untracked from Git.
- New `scripts/` directory (or `backend/scripts/`) with backup/restore shell scripts.
- `README.md` — new sections documenting local setup, Atlas setup, and backup/restore procedures.
- No business functionality is modified; existing Postgres-based services (postgres, pgadmin, n8n) keep working unchanged.