## Context

See proposal.md for the "why". The relevant current state: the whole API persists to MongoDB — identity repos (`userRepository`, `tenantRepository`, `revokedTokenRepository`), the auth flow, authorization helpers (`tenantScope.js`, `require*` middleware), and the models all assume MongoDB, single `_id` ObjectId per entity, and a single `role` string per user. `pg` is already a dependency but unused. PostgreSQL `smartcomanda_db` is provisioned (in `postgres/init.d`) with initial tables but no backend code connects to it.

The system is mid-transition: only the identity module moves to PostgreSQL in this change; other modules (branches, orders, cash sessions, inventory, customers, loyalty) remain on MongoDB and reference tenants/users by id. That constraints the design strongly.

## Goals / Non-Goals

**Goals:**
- Make PostgreSQL the single source of truth for tenants, users, roles, and revoked tokens, with the public REST contract preserved.
- Preserve cross-module references: ids of tenants/users survive the move as UUIDs, so Mongo-resident modules keep working unchanged.
- Introduce a real many-to-many role model and make authorization evaluate a role set.
- Keep the data import idempotent and safe to re-run.

**Non-Goals:**
- Migrating any other module (branches, orders, inventory, etc.) to PostgreSQL — future changes.
- Providing a user-facing admin screen to manage roles (backend capability only).
- Schema evolution for the Mongo-side modules in this change.

## Decisions

### D1. IDs: preserve Mongo ObjectId as UUID (not BIGSERIAL)
Use a UUID column as the primary key for `tenant.id`, `users.id` (and the `role_id`/PK of `user_roles`), populated from the source Mongo `_id` hex string on import.
- **Why:** `branch.tenantId`, `order.tenantId`, JWT `subject`, and every downstream reference currently stores the Mongo ObjectId. Renumbering to BIGSERIAL would rewrite every cross-module reference in Mongo during the hybrid phase — high risk.
- **Alternatives considered:** BIGSERIAL and re-point all references (rejected: breaks hybrid coexistence); string of the hex directly (accepted; stored as `UUID` for integrity/format).

### D2. New thin PostgreSQL data-access layer with the same repository signatures as today
Add `src/db/postgres.js` (a `pg` Pool) and rewrite `userRepository`, `tenantRepository`, `revokedTokenRepository` to read/write SQL while keeping the **same exported function names and return shapes** the services already use (`createUser`, `findUserByEmail`, `findUserById`, `listUsers`, `createTenant`, `findTenantById`, `revokeToken`, `isTokenRevoked`, …). Return objects keep the `_id` field (the UUID) so downstream code that reads `user._id`, `tenant._id` keeps working.
- **Why:** services (`userService`, `authService`, `tenantService`, and other modules calling `findTenantById`) are agnostic; changing signatures would ripple across the whole codebase and contradict "preserve REST contract".
- **Alternatives considered:** service-layer adapter with repositories behind an interface (heavier than needed; repository return-shape parity is enough here).

### D3. Roles represented by codes in `roles`, assignments in `user_roles`
`roles` holds the four accepted codes with a unique `code`; `user_roles` maps `user_id` → `role_id`. Users carry roles as an array. The public user payload exposes `roles: string[]` in place of `role: string`.
- **Why:** real N:M per the agreed strategy.
- **Trade-off/risk:** authorization code ("is sysadmin?") changes from `== "sysadmin"` to `.includes("sysadmin")` across the module (see D5).

### D4. Versioned SQL migrations, applied at startup, plus a one-time import
Add a Postgres migration runner mirroring the existing Mongo one (`src/db/migrations.js` style): numbered files, tracked in a `schema_migrations` table, applied in order at boot, failing fast on error. The import (tenant/users/roles/historical role assignment) is a separate idempotent step that reads Mongo and upserts into Postgres by the UUID id.
- **Why:** consistent with the project's existing migration pattern; idempotent import satisfies "re-run is safe" (upsert on the preserved UUID).
- **Migration order:** schema first, then import (so tables exist before data lands); existing accounts keep their current single role, which becomes their first `user_roles` entry; the `SYSADMIN_EMAIL` account gets `sysadmin`.

### D5. Authorization switches to role-set semantics
Update `tenantScope.js` (`isGlobalActor`, `canReadUser`, `canManageUser`, `assertUserPayloadScoped`, `getTenantFilter`) and the `require*` middleware group to interpret a set of roles, and load the fresh role set with each authenticated user lookup. JWT carries `roles` (list) as informational claims only.
- **Why:** satisfies the security property "authorize from the DB every request, never from token claims" and the multi-role model. This is the deliberate **BREAKING** internal change.

### D6. Downstream identity consumers re-point to the new source
Any repository/service that imports `findTenantById`/user lookups from the Mongo repos for identity purposes is updated to import the PostgreSQL-backed ones, so a treated module never reads identity from Mongo (preventing split-brain). This includes, at minimum, `branchRepository` and `orderRepository` (and any other module that resolves a tenant or user).
- **Why:** a tenant that moved to Postgres must be readable by modules still on Mongo — but from the Postgres source, not a stale Mongo copy.

## Risks / Trade-offs

- **ID-format drift in hybrid phase** → all identity sources are re-pointed to Postgres (D6) and ids keep Mongo form (D1), so references remain comparable; documented and tested with a login flow.
- **Authorization rewrite is transversal** → all `require*` middleware and `tenantScope.js` are updated together and verified via the full auth test path (login → authorized read/write → revoked/denied); existing tests are updated to the role-set payload.
- **Mongo vs Postgres divergence during migration** → import is one-time and idempotent (D4); after it, identity is only written via Postgres repos, so Mongo identity is read-only/ignored.
- **Consistency of revoked tokens** → deciding to move `revoked_tokens` to Postgres in this change keeps auth self-contained; logout/log-in replay risk covered by preserved jti semantics via SQL queries.
- **Service restart mid-import** → the import is idempotent and re-runnable; a partially applied import resumes cleanly on the preserved UUID keys.

## Migration Plan

1. Provision final identity schema in `postgres/init.d` (tenant, users, roles, user_roles, revoked_tokens) so it lands on a clean volume and on future flat starts.
2. Land the Postgres connection + migration runner; startup applies SQL migrations before serving.
3. Run the one-time identity import from Mongo → Postgres (upsert on UUID), then verify counts and a sample login.
4. Swap the identity repositories to Postgres and re-point downstream consumers (D6).
5. Ship the multi-role authorization rewrite (D5) and update the affected specs/tests.
6. Rollback: keep the Mongo identity collections intact (read-only) until verified; a defect can revert to the Mongo repositories while data loss is limited to changes made after the swap.

## Open Questions

- None that change the specs, approach, or task breakdown — deferred details (exact SQL column list, import chunking) are implementation-level and belong in tasks.
