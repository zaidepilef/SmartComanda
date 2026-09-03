## 1. PostgreSQL schema (postgres/init.d)

- [x] 1.1 Update `postgres/init.d/` with the final identity schema in `smartcomanda_db`: `tenant` (uuid PK), `users` (uuid PK), `roles` (code unique), `user_roles` (user_id/role_id/tenant_id), `revoked_tokens` (jti unique, expires_at) — verify by re-running `docker compose up -d postgres` and confirming the tables via `psql -d smartcomanda_db -c '\dt'`
- [x] 1.2 Seed the four role codes (`sysadmin`, `owner`, `admin`, `cashier`) idempotently with `ON CONFLICT (code) DO NOTHING` — verify roles table has exactly 4 rows after a re-run
- [x] 1.3 Confirm existing `postgres/init.sql` still creates the core databases and does not conflict with the new identity schema — verify a fresh `docker compose up -d postgres` leaves `restaurant_saas`, `n8n_db`, and `smartcomanda_db` all present

## 2. PostgreSQL connection layer

- [x] 2.1 Add `src/db/postgres.js` exporting a `pg` Pool (connectString from env) and `getPgPool()`/`closePg()` helpers — verify a temporary script can `SELECT 1` against `smartcomanda_db`
- [x] 2.2 Read `DATABASE_URL` (and PG fallbacks) in `src/config/env.js` and fail fast with a clear error when missing — verify startup without `DATABASE_URL` exits non-zero with a descriptive log
- [x] 2.3 Wire Postgres connection + SQL migration runner into `src/server.js` startup, running migrations before the API listens — verify the server boots and logs "PostgreSQL connected" and "No pending migrations" on a second run

## 3. SQL migrations + one-time identity import

- [x] 3.1 Add a Postgres migration runner (`src/db/migrations-pg.js`) that applies numbered SQL files tracked in a `schema_migrations` table, failing startup on error — verify a pending migration is applied in order and re-running does not re-apply
- [x] 3.2 Create migration(s) for the full identity schema (tenant/users/roles/user_roles/revoked_tokens) with UUID primary keys — verify tables/columns exist and are reflected in `schema_migrations`
- [x] 3.3 Implement a one-time idempotent import that reads `user`, `tenant`, and role data from MongoDB and upserts into Postgres preserving each source `_id` as UUID — verify row counts match Mongo and a second run inserts no duplicates
- [x] 3.4 Map existing accounts into roles: the `SYSADMIN_EMAIL` account gets `sysadmin`; others keep their current role as their initial `user_roles` entry — verify the imported role sets match expectations

## 4. Rewrite identity repositories to PostgreSQL

- [x] 4.1 Rewrite `userRepository.js` against Postgres keeping the same exported names and return shapes (including `_id`) and adding role-set reads/writes — verify `findUserByEmail`/`findUserById` return users with their roles and existing tests pass under the new source
- [x] 4.2 Rewrite `tenantRepository.js` against Postgres keeping signatures/shapes, with `userCount`/`branchCount` computed via SQL (branch count still reads Mongo branches by matching tenant id) — verify `listTenants` returns counts correctly
- [x] 4.3 Add `roleRepository.js` and `userRoleRepository.js` for role lookup and user↔role assignment/replacement — verify assigning multiple roles to one user is persisted and retrievable
- [x] 4.4 Rewrite `revokedTokenRepository.js` against Postgres (`revokeToken`, `isTokenRevoked`) — verify logout marks a jti and a second request with that token is rejected
- [x] 4.5 Add a SQL migration/DDL step that removes the Mongo `users`, `tenants`, and `revoked_tokens` collections from active use (mark deprecated / no longer read) — verify no identity repo imports the Mongo collections

## 5. Multi-role model in services and API

- [x] 5.1 Update `src/models/user.js` so `USER_ROLES` maps to a role set and `toPublicUser`/`toUserDocument` handle a `roles` array (dropping singular `role`) — verify public user payload exposes `roles` and never the password hash
- [x] 5.2 Update `userService.js` so create/update accept and validate a `roles` array (reject unknown roles, enforce anti-escalation for `admin`) and return the role set — verify an `admin` cannot grant `sysadmin` and a `sysadmin` can assign multiple roles
- [x] 5.3 Update `authService.js` so `issueToken` embeds `roles` (list) as informational claims and `subject` uses the UUID — verify an issued JWT decodes with the expected `roles` claim
- [x] 5.4 Update `tenantService.js` create/update to pass through the UUID tenant id and Postgres-backed repository — verify tenant CRUD works end-to-end through the API

## 6. Authorization (role-set semantics)

- [x] 6.1 Update `tenantScope.js` (`isGlobalActor`, `canReadUser`, `canManageUser`, `assertUserPayloadScoped`, `getTenantFilter`) to evaluate a role set — verify each helper returns the same verdicts for single-role users as before, and the expected verdicts for multi-role users
- [x] 6.2 Update the `require*` middleware group (`requireManager`, `requireOwner`, `requireSysadmin`, `requireSysadminOrAdmin`) to check set membership — verify a user holding `[admin, cashier]` passes `requireManager` and a pure `cashier` is denied
- [x] 6.3 Update `authRequired` to load the fresh role set from Postgres on each request and authorize against it — verify a token user whose role was removed from the DB is denied on the next request
- [x] 6.4 Update all protected routes/tests that reference `user.role` to the `roles` set — verify the full suite passes with no `role` singular references left

## 7. Re-point downstream identity consumers

- [x] 7.1 Update downstream modules that call identity lookups (`findTenantById`, user resolution) in e.g. `branchRepository`, `orderRepository`, `cashSessionRepository` to import the Postgres-backed repositories — verify a tenant created via API is resolvable from these modules and existing flows work
- [x] 7.2 Add a login end-to-end verification: register/login a user, hit a protected route, log out, and confirm revoked-token rejection — verify the whole auth path works against Postgres-backed identity

## 8. Tests, docs, and validation

- [x] 8.1 Update existing tests that assert the Mongo collections / singular `role` to the Postgres-backed behavior and `roles` payload — verify `npm test` passes
- [x] 8.2 Run the API with a clean Postgres volume and confirm migrations + import produce a working identity/auth flow — verify a full `docker compose up -d --build` boots healthy and a login succeeds
- [x] 8.3 Update Swagger/API docs payloads that describe the user to show `roles` — verify `/api/docs` renders the updated schema
