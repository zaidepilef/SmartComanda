## Context

The backend runs a versioned MongoDB migration runner (`src/db/migrations.js`) that executes numbered files from `src/migrations/` in order at startup, tracking applied versions in the `migrations` collection. Existing migrations (`001_create_users`, `002_create_revoked_tokens`) only create indexes; MongoDB collections are created implicitly. The backend currently persists only `users` and `revoked_tokens`. See proposal.md for motivation; see specs/tenant-data-model/spec.md for the schema requirements.

## Goals / Non-Goals

**Goals:**
- Deliver the core operational schema (`tenants`, `branches`, `orders`, extended `users`) through the existing migration runner with zero changes to the runner itself.
- Follow the existing migration style: idempotent index creation, no data backfill.
- Keep the migration fully backward compatible with existing user documents.

**Non-Goals:**
- No API routes, services, controllers, or repositories for the new entities (future changes).
- No seed/default tenant data.
- No changes to `docker-compose.yml`, environment config, or new dependencies.

## Decisions

**1. Single migration file `003_create_tenant_data_model.js`**
One migration covers all four collections since they ship together as the initial schema. Each `up(db)` creates indexes per collection, which also materializes the collections.
- Alternative considered: one migration per collection. Rejected — they are one logical schema milestone and would make versioning noisier.

**2. Index strategy: create indexes only where lookups are defined**
- `tenants`: unique index on `rut` (natural business key), index on `active`.
- `users`: index on `tenantId` (new optional field; existing unique index on `email` stays).
- `branches`: index on `tenantId`, index on `active`.
- `orders`: index on `tenantId`, index on `foodtruckId`, index on `status`.
- Rationale: matches spec requirements and the query patterns implied by the documents; no speculative indexes.

**3. `users` extension is additive, not breaking**
The migration only adds an index on `tenantId`; the fields themselves are plain document fields in MongoDB (schema-less), so no ALTER is needed. The user model (`toUserDocument`) is not touched in this change — it still writes the original fields, and the new fields remain optional until a future change wires them in.
- Alternative considered: updating `models/user.js` now. Rejected — schema-only scope; model changes belong to the future tenant-scoped user feature.

**4. Field naming follows the source objects with corrections**
- `razon_social` → `razonSocial` (camelCase, consistent with `tenantId`/`foodtruckId`).
- `client_contac` → `clientContact` (typo corrected).
- `_id` stays MongoDB's default `ObjectId`; `tenantId`/`foodtruckId` are stored as `ObjectId` references (no DB-level foreign keys in MongoDB).

**5. Role model: closed enum with a global super user**
- `role` is a closed enum: `sysadmin`, `owner`, `admin`, `cashier`, with hierarchy `sysadmin` > `owner` > `admin` > `cashier`.
- `sysadmin` is global: it has no `tenantId` (absent or null) and can operate across all tenants; the other roles always belong to a tenant.
- Many users per tenant: `tenantId` on `users` is a plain (non-unique) index, so multiple users can reference the same tenant.
- Enforcement (rejecting invalid roles, authorization rules) lives in the future validation/authorization layer, not in this schema-only migration — MongoDB has no enum constraint. Documented in the spec as the contract for that future layer.
- Alternative considered: a `roles` collection or per-role embedded docs. Rejected — over-engineering for a four-value closed enum; constants in code suffice.

## Risks / Trade-offs

- **Naming drift vs. future API** — If a future change names the collections differently (e.g., `foodtrucks`), the migration would need to be revisited. → Mitigation: `branches` naming was explicitly confirmed with the user; document the mapping in the proposal.
- **`rut` uniqueness assumption** — Real tenants share no RUT; if that assumption fails (e.g., one RUT per franchise), the unique index breaks inserts. → Mitigation: index is part of migration 003; if needed, a later migration can drop it.
- **Migration failure mid-run** — If index creation fails partway, the runner exits without recording the version, so a retry re-runs it; index creation is idempotent. → Mitigation: relies on the existing runner behavior (tested scenario in spec).
- **Old user documents without `tenantId`** — Queries scoping by tenant will not match them. → Mitigation: acceptable; new fields are optional, and the absence of `tenantId` is also the expected shape of a global `sysadmin` user, so it is a valid state, not an error.

## Migration Plan

1. Implement `backend/src/migrations/003_create_tenant_data_model.js`.
2. Verify manually: `docker compose up -d mongodb`, start backend with `MONGODB_URI`, confirm the log line `Running migration 3: 003_create_tenant_data_model.js` and that `migrations` records version `3`.
3. Verify collections/indexes via `mongosh`: `tenants`, `branches`, `orders` exist with expected indexes; `users` has the `tenantId` index.
4. Confirm existing users remain intact and `002` is not re-run (already in `migrations`).

**Rollback:** Remove the migration record (`migrations` version `3`) and drop the created collections and the `users.tenantId` index. No destructive operations on existing data.

## Open Questions

None — deferrable unknowns were resolved (collection naming via user confirmation).