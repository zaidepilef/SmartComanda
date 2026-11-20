## 1. Backend (@backend)

- [x] 1.1 Delete `src/db/mongo.js`, `src/db/migrations.js`, `src/migrations/`, `src/db/import*.js`
- [x] 1.2 Reimplement `generateObjectIdHex` with `node:crypto` (same 24-hex format)
- [x] 1.3 Remove `ObjectId` usage from `dishService`
- [x] 1.4 Remove `MONGODB_URI` from `config/env.js` and `env.example`; document `DATABASE_URL`
- [x] 1.5 Drop `mongodb` dependency and Mongo `db:*` scripts; add `db:backup` / `db:restore`
- [x] 1.6 Update README and MIGRATION.md
- [x] 1.7 Verify: no `mongodb` import in `src/`/`tests/`; unit tests (FIFO, schemas) pass

## 2. Monorepo

- [x] 2.1 Remove `mongodb` service, volume and `MONGODB_URI` from `docker-compose.yml`
- [x] 2.2 Replace Mongo scripts with `db-backup.sh` / `db-restore.sh` (pg_dump/pg_restore)
- [x] 2.3 Remove Mongo variables from `.env.example`; update README
- [x] 2.6 Harden `db-backup.sh` (write to `.partial`, keep only non-empty dumps) and `db-restore.sh` (reject empty dumps); verified: restore of an empty dump exits 1, backup/restore round-trip restores deleted rows
- [ ] 2.4 Bump `SmartComanda_api` submodule pointer once the backend change is merged
- [ ] 2.5 Decide fate of the legacy Mongo dumps tracked under `backups/`

## 3. Verification (needs Docker)

- [x] 3.1 `docker compose up -d --build` with no `mongodb` service; `GET /health` → `connected`
- [x] 3.2 Smoke test dishes, inventory entry/exit, order create/pay, cash session open/close
- [x] 3.3 `npm run db:backup` then `npm run db:restore -- --yes` round-trip

## 4. Follow-up

- [ ] 4.1 Rewrite `tenant-data-model` spec: its requirements still describe MongoDB collections; restate them as the PostgreSQL tables in `migrations-pg/003`–`012`
