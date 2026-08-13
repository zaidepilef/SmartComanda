## 1. Migration file

- [x] 1.1 Create `backend/src/migrations/003_create_tenant_data_model.js` with an exported `up(db)` following the style of `001_create_users.js` (constants for collection names, `createIndex` calls).
- [x] 1.2 In `tenants`: create a unique index on `rut` and an index on `active`.
- [x] 1.3 In `users`: create an index on `tenantId` (existing `email`/`status` indexes untouched).
- [x] 1.4 In `branches`: create an index on `tenantId` and an index on `active`.
- [x] 1.5 In `orders`: create an index on `tenantId`, an index on `foodtruckId`, and an index on `status`.

## 2. Verification

- [x] 2.1 Run the backend with a local MongoDB (`docker compose up -d mongodb` + `MONGODB_URI`) and confirm the log `Running migration 3: 003_create_tenant_data_model.js` and that version `3` is recorded in the `migrations` collection.
- [x] 2.2 Verify via `mongosh` that `tenants`, `branches`, and `orders` collections exist with the expected indexes, and that `users` has the `tenantId` index.
- [x] 2.3 Confirm previously applied migrations (`001`, `002`) are not re-run and existing user documents remain intact.
- [x] 2.4 Restart the backend a second time and confirm the migration is not re-executed (no pending migrations log).