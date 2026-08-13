## Why

The backend currently only persists users and revoked tokens. SmartComanda needs its core operational data model in MongoDB — tenants, users tied to tenants, branches (food trucks), and orders — to support multi-tenant order management. This change adds the initial schema via the existing versioned migration runner so the collections and indexes exist before any API feature builds on them.

## What Changes

- Add a new versioned migration (`003`) that creates the core collections and indexes in MongoDB:
  - `tenants`: `name`, `rut`, `razonSocial`, `active`, plus timestamps.
  - `users`: extend the existing collection with optional `tenantId`, `name`, and `role` fields; existing documents remain compatible. Many users can belong to one tenant; `role` is one of `sysadmin` (super user, global, without tenant), `owner`, `admin`, `cashier`.
  - `branches`: `tenantId`, `name`, `type` (e.g., `FoodTruck`), `active`, plus timestamps. Named `branches` per decision (the objects refer to food trucks, referenced as `foodtruckId` from orders).
  - `orders`: `tenantId`, `foodtruckId`, `status` (e.g., `pending`), `clientContact`, `items`, `total`, plus timestamps.
- Create indexes on foreign-key fields (`tenantId`, `foodtruckId`, `status`, `active`) and unique indexes where appropriate.
- No API routes or services change in this change; it is schema-only.

## Capabilities

### New Capabilities
- `tenant-data-model`: Initial MongoDB schema for the core operational entities — tenants, tenant-scoped users, branches, and orders — applied through the versioned migration runner at backend startup.

### Modified Capabilities
<!-- None: the `users` API behavior does not change in this change; the migration only adds optional fields to the persisted user document, and no route or service behavior changes. -->

## Impact

- `backend/src/migrations/003_create_tenant_data_model.js` (new migration file).
- MongoDB collections `tenants`, `branches`, `orders` created; `users` gains optional fields.
- `backend/src/db/migrations.js` runner picks up the new file automatically (version-ordered, tracked in `migrations` collection).
- Existing data: no destructive changes; `users` migration is additive and backward compatible.
- No dependency or configuration changes.