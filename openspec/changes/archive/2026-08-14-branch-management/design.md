## Context

See proposal.md - Why. The `branches` collection already exists (migration 003) with indexes on `tenantId` and `active`; MongoDB is schemaless so no migration is needed for the new `address`/`city`/`phone` fields. The backend is layered (routes → controllers → services → repositories) and the `tenants` CRUD is the established pattern to mirror. Tenant scoping utilities (`getTenantFilter`, `isGlobalActor`) are not needed here because all branch endpoints are sysadmin-only by decision — the `tenantId` is supplied explicitly by the client.

## Goals / Non-Goals

**Goals:**
- Sysadmin-only branch API with tenant validation on create/update.
- Dedicated frontend screen with tenant combobox, role-guarded at route and nav level.
- Consistent with existing conventions: error mapping, zod validation, signals-based Angular component.

**Non-Goals:**
- No tenant-scoped reads for non-sysadmin roles (deferred until the POS/orders need them).
- No DELETE endpoint; deactivation only.
- No changes to tenants/users/auth APIs.

## Decisions

### 1. Backend mirrors the tenants module exactly
New files follow `tenantSchemas.js` / `tenantRepository.js` / `tenantService.js` / `tenantController.js` / `routes/tenants.js` structure and error mapping (`BadRequestError`, `NotFoundError`, `ConflictError`, `ForbiddenError`). Zod schemas validate the payload; `listBranchesQuerySchema` validates `tenantId` and `active` query params.

**Rationale**: consistency keeps review cost low; the module is small enough that a copy-pattern is cheaper than abstraction.

### 2. Tenant existence is validated in the service layer
`branchService.createBranch` / `updateBranch` check the target `tenantId` via `tenantRepository.findTenantById` and throw `NotFoundError("Tenant not found.")` when missing. Invalid ObjectIds are rejected with 404 in the repository, matching `tenantRepository` behavior.

**Rationale**: prevents orphaned branches; keeps repository logic data-access-only.

### 3. Branch type is a two-value enum
`type` is restricted to `Sucursal` | `FoodTruck` in the zod schema (migration used `FoodTruck` as the example value; `Sucursal` covers fixed branches).

**Rationale**: the data model kept `type` free-form, but an enum prevents typos and gives the UI a clean selector. If more types appear later, the enum extends.

### 4. Frontend role gating uses the loaded profile, not JWT claims
A new `sysadminGuard` reads `AuthService.user()`; when the profile is not yet loaded it awaits `me()` before deciding. The nav item gets an optional `roles` field and `DefaultLayoutComponent` filters `navItems` by the current user's role.

**Rationale**: `/api/auth/me` already returns `role`/`tenantId` (they were added for tenant-data-isolation); the UI shows only what the API would allow anyway, and the backend `requireSysadmin` remains the enforcement point.

### 5. Tenant combobox drives both filtering and assignment
The screen loads all tenants (active and inactive) into a combobox. Selecting a tenant filters the branch list (`GET /api/branches?tenantId=...`). The same tenant is prefilled when creating a branch and editable when updating (reassignment).

**Rationale**: one control serves the three flows; listing inactive tenants is required to manage branches of deactivated tenants.

### 6. Tenant list links to the branches screen; branchCount added to tenants API
`GET /api/tenants` gains `branchCount` via a second `$lookup` on `branches` (mirroring the existing `userCount`). The tenants list shows the count and a per-row button navigating to `/branches?tenantId=<id>`; `BranchesComponent` reads the query param on init to preselect the combobox (which stays freely changeable — KISS).

**Rationale**: single navigation path from the tenant context; query param keeps the route declarative and shareable.

### 7. MVP: branch navigation open to all roles
The tenants-list button and count are visible to all authenticated roles, and the `sysadminGuard` is removed from the `/branches` route and the nav `roles` filter is dropped. The backend API remains `sysadmin`-only for now: non-sysadmin users hitting `/api/branches` receive 403.

**Rationale**: explicit user decision ("option C, estamos en MVP; el acceso lo resolvemos después"). Frontend access control will be revisited in a future change.

## Risks / Trade-offs

- [Reassignment moves a branch between tenants] → Intended per spec; the UI makes the current tenant explicit in the edit form.
- [Non-sysadmin roles cannot list branches even for future POS needs] → Accepted by decision; scope can be relaxed later with `getTenantFilter(actor)`.
- [`AuthUser.role` absent for users with old stored profiles] → `/me` always returns the DB user; interface gains the fields so the guard is reliable.
- [Combobox lists every tenant; long lists hurt usability] → Acceptable at current scale; KISS.

## Migration Plan

- No data migration. Deploy backend (mounts `/api/branches`), deploy frontend (new route/nav).
- Rollback: remove the router mount and the frontend route/nav item; no schema or data effects to undo.
