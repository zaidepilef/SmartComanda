## Why

SmartComanda's auth, users, and tenants currently live entirely in MongoDB, but the project is moving its operational data to PostgreSQL (`smartcomanda_db`). This change migrates the entire identity module — tenants, users, roles, authentication, and authorization — off MongoDB and onto PostgreSQL, while preserving the existing API contract, so the rest of the system can later follow the same path. The business also needs a true many-to-many role model instead of a single per-user role.

## What Changes

- **Add a PostgreSQL connection layer** in the API (pool + config), independent of MongoDB.
- **Migrate the identity data model** (`tenant`, `users`, `roles`, `user_roles`) to PostgreSQL: tables, versioned migration, and a one-time data copy from MongoDB preserving each object's Mongo `_id` as a UUID so cross-module references keep working.
- **Replace the identity repositories** (`userRepository`, `tenantRepository`, `revokedTokenRepository`, plus new role/user-role repositories) to read/write PostgreSQL.
- **Introduce a real many-to-many role model**: a user can hold multiple roles (`sysadmin`, `owner`, `admin`, `cashier`). **BREAKING** internal: `role` (singular) → `roles` (set).
- **Rewrite the authorization layer** (middleware `requireManager`/`requireOwner`/`requireSysadmin`/`requireSysadminOrAdmin`, and `tenantScope.js` helpers) to check a set of roles rather than a single role. **BREAKING** internal.
- **Update the JWT** to carry the user's role set (informational) and keep `subject` aligned with the UUID id.
- **Point downstream identity consumers** (e.g. `branchRepository`, `orderRepository` calling `findTenantById`) at the PostgreSQL-backed source so no module reads identity from Mongo anymore.
- **Kept**: the public REST contract for `/api/auth`, `/api/users`, `/api/tenants` stays compatible (same routes, status codes, and response shapes), except the user payload now exposes a `roles` array.

## Capabilities

### New Capabilities
- `identity-postgres-storage`: Establishes the PostgreSQL connection for identity data and persists tenants, users, roles, and user-role assignments in `smartcomanda_db`, with versioned SQL migrations and a one-time data import from MongoDB preserving IDs as UUIDs.

### Modified Capabilities
- `user-auth`: JWT/API role handling changes from a single `role` to a set of `roles`; login verifies credentials against PostgreSQL-backed users; role claims become a list.
- `users`: User CRUD persists to PostgreSQL instead of MongoDB; users carry multiple roles; write/read authorization evaluates a role set; the response exposes a `roles` array.
- `tenant-data-isolation`: Global/sysadmin checks change from `role === "sysadmin"` to the role set containing `sysadmin`, across all tenant-scoping helpers.
- `tenant-management`: Tenant CRUD persists to PostgreSQL instead of MongoDB, with UUID ids; userCount/branchCount queries adapt to SQL.
- `tenant-data-model`: The identity data model definition changes from MongoDB collections to PostgreSQL tables (tenant, users, roles, user_roles) with UUID ids.

## Impact

- **Backend** (`/backend`): new `src/db/postgres.js`; new SQL migration runner; rewritten `userRepository`, `tenantRepository`, `revokedTokenRepository`; new `roleRepository`/`userRoleRepository`; updated `userService`, `authService`, `tenantService`; updated authorization middleware and `tenantScope.js`; updated models (`user.js`, new role model); `config/env.js` reads `DATABASE_URL`.
- **Downstream repos** that reference identity (`branchRepository`, `orderRepository`, `cashSessionRepository`, etc.) update their `findTenantById`/user lookups to the Postgres source.
- **PostgreSQL** (`postgres/init.d`): final identity schema (tenant, users, roles, user_roles) in `smartcomanda_db`.
- **MongoDB**: identity collections (`users`, `tenants`, `revoked_tokens`) are no longer the source of truth and are removed from active use; identity data migration triggers `shared` sync with the rest before those collections stop being authoritative.
- **Environment**: `DATABASE_URL` is now required and read at startup.
- **Dependencies**: `pg` (already present) becomes actively used; no new runtime dependency.
