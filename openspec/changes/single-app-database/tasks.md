## 1. Configuration

- [x] 1.1 Set `POSTGRES_DB=smartcomanda` in `.env.example`; verify `grep -rn restaurant_saas .env.example` returns nothing
- [ ] 1.2 Point `@backend` `env.example` `DATABASE_URL` to `smartcomanda`; commit and push in `SmartComanda_api`, then bump the submodule pointer
- [x] 1.3 Create only `smartcomanda` in `postgres/init.sql` and `postgres/init.d/00_core_databases.sql`; verify `grep -rn restaurant_saas postgres/` returns nothing

## 2. Local environment

- [x] 2.1 Back up `restaurant_saas` (`npm run db:backup` while it is still `POSTGRES_DB`) and verify a non-empty dump exists in `backups/`
- [x] 2.2 Switch the local `.env` to `POSTGRES_DB=smartcomanda`, recreate `api`; verify the API's `DATABASE_URL` targets `smartcomanda` and `GET /health` is `connected` with no new migrations applied
- [x] 2.3 Drop `restaurant_saas`; verify it no longer appears in `pg_database` (legacy empty `n8n_db` is tracked by remove-n8n 4.2)

## 3. Verification

- [x] 3.1 The API serves existing `smartcomanda` data: `GET /api/public/menu` returns Sanwuchon / El Hamburgueson with its dishes (HTTP 200)
- [x] 3.2 `npm run db:backup` produces a non-empty `smartcomanda-<timestamp>.dump`
