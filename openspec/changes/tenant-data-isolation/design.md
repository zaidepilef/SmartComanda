## Context

See proposal.md - Why. Current state: the tenant data model exists (`users.tenantId`, roles, `tenants` collection) but no enforcement layer. `authRequired` already attaches `req.user` (full public user, including `role` and `tenantId`) on every request. Writes on `/api/users` and `/api/tenants` are gated by `requireSysadmin`; reads are ungated. Backend is layered: routes → controllers → services → repositories (MongoDB).

## Goals / Non-Goals

**Goals:**
- Close the IDOR gap: all user/tenant reads scoped by the actor's `tenantId`; `sysadmin` unscoped.
- Give `admin` write access to users within its own tenant, with anti-escalation guards.
- Expose `role` + `tenantId` as JWT claims for client-side convenience.
- Keep the enforcement logic reusable so future collections (`branches`, `orders`) inherit scoping.

**Non-Goals:**
- No schema or migration changes.
- No changes to `POST/PUT /api/tenants` (remain sysadmin-only).
- `DELETE /api/users/:id` remains sysadmin-only ("baja" is handled via status update).
- No frontend implementation; `frontend-admin` may consume the new claims later.
- No scoping of `branches`/`orders` endpoints (they do not exist as APIs yet).

## Decisions

### 1. Actor-aware services (actor passed into the service layer)
Controllers pass `req.user` (the actor) into service functions, and services decide per resource: `userService.listUsersPaginated({ actor, query })`, `getUser({ actor, id })`, etc. Authorization and tenant filtering live in the service layer, not in middleware.

**Rationale**: resource-level rules (e.g., an `admin` may edit a same-tenant user but not a sysadmin) need the target document, which middleware only sees after the repo query anyway. Services can fetch the target and decide atomically.
**Alternative considered**: a `tenantScope` middleware injecting a filter into `req`. Rejected because it only handles list-filters cleanly; per-resource 403 rules would still leak into services, splitting the policy in two places.

### 2. Single scope/authorization helper
A small module (e.g., `backend/src/utils/tenantScope.js`) centralizes the policy:
- `isGlobalActor(actor)` → `actor.role === "sysadmin"`.
- `getTenantFilter(actor)` → `{}` for sysadmin, else `{ tenantId: actor.tenantId }`.
- `canManageUser(actor, targetUser)` → sysadmin, or `actor.role === "admin"` and `targetUser.tenantId` equals `actor.tenantId` (never for sysadmin targets).
- `assertUserPayloadScoped(actor, payload)` → an `admin` payload must not set `role: sysadmin` and must not set a `tenantId` different from the actor's own.

**Rationale**: one place to extend when `branches`/`orders` gain APIs; consistent 403 semantics everywhere (users chose 403 over 404 for cross-tenant access — existence leaks accepted).

### 3. Route guards become coarse gates; precise checks live in services
Routes keep only role gates that are independent of the target document:
- `GET /api/users` and `GET /api/users/:id`: any authenticated user (scoping enforced in service).
- `POST /api/users`, `PUT /api/users/:id`: `sysadmin` or `admin`.
- `DELETE /api/users/:id`: `sysadmin` only.
- `GET /api/tenants`: any authenticated user (scoping in service).
- `POST/PUT /api/tenants`: unchanged, `requireSysadmin`.

A new middleware (e.g., `requireSysadminOrAdmin`) replaces `requireSysadmin` on the write routes. All tenant/scope checks on the target resource happen in services and return `ForbiddenError` (403).

### 4. Repository-level tenant filters
- `userRepository.listUsers` accepts an optional `tenantId` in its filter so listing is a single indexed query (`users.tenantId` is already indexed).
- `tenantRepository.listTenants` supports restricting by a single id for tenant-scoped reads.
- `userCount` keeps its global semantics (count of all users referencing the tenant) per the existing spec.

### 5. JWT claims without shifting authority
`authService.issueToken` adds `role` and `tenantId` (omitted when absent) to the JWT payload. Authorization continues to load the user from the database on every request (`authRequired`), so claims are never trusted for decisions — they are UI convenience only.

**Alternative considered**: embedding full authorization data in the token (stateless JWT). Rejected: role/tenant changes (e.g., an admin demoted) would remain effective until token expiry.

## Risks / Trade-offs

- [Admin grants persist via stale tokens if claims were authoritative] → Authorization always re-reads the user from DB per request; claims never gate access.
- [Future endpoints (branches/orders) forget to scope] → Enforced by design: they must use `getTenantFilter(actor)`; reviewed in code review.
- [403 reveals resource existence] → Accepted explicitly by design decision (users preferred 403 over 404).
- [An `admin` could still create `owner`/`admin`/`cashier` users inside its tenant and later edit them] → Within scope by design; `owner` and `cashier` remain read-only, so only other admins can be escalated — mitigation: admin cannot create other admins' data outside tenant, and sysadmin remains the only role that can touch other tenants.
- [`userCount` computed over all users could reveal relative tenant sizes to a tenant user?] → A tenant user only ever sees its own tenant's count, so no cross-tenant leak.

## Migration Plan

- No data migration. Deploy backend; behavior changes immediately for non-sysadmin clients (scoped responses).
- Existing JWTs without `role`/`tenantId` claims remain valid; `authRequired` does not depend on them, so no token invalidation or forced re-login is needed.
- Rollback: revert the code changes; no schema or data effects to undo.
