## Why

PostgreSQL bootstrap creates two application databases, `smartcomanda` and `restaurant_saas`, while `.env.example` points the API at `restaurant_saas` and the init script comment says the API uses `smartcomanda`. A developer creating `.env` from the template silently switches the API to a different (empty) database, hiding the real data. The application needs exactly one database, and every config source must agree on it.

## What Changes

- The application database is `smartcomanda`. `.env.example` sets `POSTGRES_DB=smartcomanda`; `@backend` `env.example` `DATABASE_URL` points to `smartcomanda`.
- `postgres/init.sql` and `postgres/init.d/00_core_databases.sql` create only `smartcomanda`.
- Local environments: back up and drop the `restaurant_saas` database (it held only test data).
- **BREAKING (ops)**: environments whose `.env` still sets `POSTGRES_DB=restaurant_saas` must switch to `smartcomanda`, migrating data first if that database holds real data.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `postgres-only-persistence`: the single-datastore requirement now also fixes one named application database (`smartcomanda`) that bootstrap, templates and the API agree on.

## Impact

- Monorepo: `.env.example`, `postgres/init.sql`, `postgres/init.d/00_core_databases.sql`, `openspec/`.
- `@backend` (`SmartComanda_api`): `env.example` only; no code change (the API reads `DATABASE_URL`).
- No schema change: `smartcomanda` already has all 12 PostgreSQL migrations applied.
