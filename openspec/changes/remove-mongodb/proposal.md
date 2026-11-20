## Why

Every repository in `@backend` already reads and writes PostgreSQL (see `SmartComanda_api/MIGRATION.md`), and the API no longer opens a MongoDB connection. MongoDB survives only as dead weight: the `mongodb` npm dependency (used just to generate ids), unused Mongo migrations and one-time importers, a `mongodb` Docker service, Mongo backup scripts, and documentation that still describes a dual-database architecture. This misleads contributors and keeps an unused service running. SmartComanda's architecture is PostgreSQL only.

## What Changes

- **Backend**: remove `src/db/mongo.js`, `src/db/migrations.js`, `src/migrations/` (Mongo), and the `src/db/import*.js` Mongo→PG importers and their `db:import-*` scripts. Drop the `mongodb` dependency. `utils/id.js` generates the same 24-hex id format with `node:crypto`. `dishService` stores recipe/branch-price ids as plain strings. `config/env.js` no longer reads `MONGODB_URI`.
- **Orchestration**: remove the `mongodb` service and `smartcomanda_mongodb_data` volume from `docker-compose.yml`, and `MONGODB_URI` from the `api` service.
- **Scripts**: replace the MongoDB lifecycle/backup/restore scripts (local + Atlas) with `scripts/db-backup.sh` and `scripts/db-restore.sh` built on `pg_dump`/`pg_restore` (a failed or empty dump is never kept, and an empty dump is never restored), exposed as `npm run db:backup` / `db:restore`.
- **Config/docs**: remove `MONGODB_URI`, `MONGODB_PORT`, `ATLAS_MONGODB_URI` from `.env.example` and both READMEs; document PostgreSQL as the only datastore.
- **BREAKING (ops)**: `npm run db:up|down|status|backup:local|restore:local|backup:atlas|restore:atlas` and `db:import-*` no longer exist. No MongoDB data is imported (decision recorded in `MIGRATION.md`: clean migration).

## Capabilities

### New Capabilities
- `postgres-only-persistence`: PostgreSQL is the single datastore; no runtime, dependency, or orchestration reference to MongoDB.

### Removed Capabilities
- `mongodb-infrastructure`: all requirements removed.

### Modified Capabilities
- `users`: the MongoDB "Versioned schema migrations" requirement is removed (covered by `identity-postgres-storage`).
- `branches-postgres-storage`, `identity-postgres-storage`: one-time MongoDB import requirements removed.

## Impact

- `@backend` (SmartComanda_api): code, `package.json`, lockfile, README, `env.example`, `MIGRATION.md`.
- Monorepo: `docker-compose.yml`, `.env.example`, `README.md`, `scripts/`, `openspec/`.
- Existing local `smartcomanda_mongodb_data` Docker volumes become orphaned; remove manually with `docker volume rm smartcomanda_mongodb_data` once no longer needed.
