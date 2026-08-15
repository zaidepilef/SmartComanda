## Context

See proposal.md - Why. The `branch-management` change shipped a sysadmin-only branch API and a table-based `/branches` screen with a tenant combobox. Roles are `sysadmin` (global), `owner`/`admin`/`cashier` (tenant-scoped). Tenant scoping utilities exist in `backend/src/utils/tenantScope.js` (`getTenantFilter`, `isGlobalActor`, `assertUserPayloadScoped`) and the users module demonstrates actor-aware services with `requireSysadminOrAdmin`. `GET /api/tenants` is already authenticated + tenant-scoped, so the frontend combobox keeps working for tenant managers (they see only their own tenant).

## Goals / Non-Goals

**Goals:**
- One access model for branches: `sysadmin` global, `admin`/`owner` scoped to their own tenant, `cashier` blocked — enforced in the backend, mirrored in the UI.
- Card-based branch list with name/state/tenant filters and a per-card detail navigation.
- Detail screen with edit form and a tab structure ready for future sections.

**Non-Goals:**
- No changes to the users module (`requireSysadminOrAdmin` stays as-is).
- No backend implementation of menu/tables/schedules — those are placeholder tabs only.
- No `DELETE /api/branches` (deactivation remains the only removal mechanism).
- No changes to `GET /api/tenants` or the tenants list.

## Decisions

### 1. New `requireManager` middleware (sysadmin | admin | owner)
A new `backend/src/middleware/requireManager.js` checks `req.user.role` against `["sysadmin", "admin", "owner"]` and 403s otherwise. The branches router switches from `requireSysadmin` to `requireManager`.

**Rationale**: `requireSysadminOrAdmin` exists for the users module but excludes `owner`; reusing it would silently grant owner access to user management. A dedicated middleware keeps the two access models independent. Alternative (adding `owner` to `requireSysadminOrAdmin`) rejected: would change users-module behavior.

### 2. Actor-aware branch service using existing tenant-scope utilities
`branchService` gains the actor as first parameter:
- `listBranches(actor, { tenantId, active, q })`: if not global, force `tenantId = actor.tenantId` (ignores any client-provided `tenantId`); apply `q` as a case-insensitive regex on `name` in the repository.
- `createBranch(actor, input)`: non-global actors may only use their own `tenantId` → `ForbiddenError` otherwise.
- `updateBranchById(actor, id, input)`: non-global actors may only update branches of their own tenant and may not change `tenantId` → `ForbiddenError`; branch ownership checked before update.
- `getBranchById(actor, id)`: repository lookup by id; non-global actors get `ForbiddenError` when the branch belongs to another tenant.

**Rationale**: mirrors the users module pattern (`canManageUser`/`assertUserPayloadScoped`), keeps enforcement in one place, and the controller just passes `req.user`. Alternatives (middleware-level tenant checks) rejected: business rules belong in the service layer, consistent with the codebase.

### 3. `GET /api/branches/:id` added to the API
New controller/repository method `findBranchById` (already present in `branchRepository` for update flows) exposed as `GET /:id` with the same scoping.

**Rationale**: the detail screen needs a single-branch fetch; loading it from the list would couple the screen to list filters.

### 4. Card grid replaces the table; tenant filter is sysadmin-only
`BranchesComponent` renders a responsive grid of branch cards. Each card shows name, type badge (reusing the existing `BRANCH_TYPE_BADGES` color pairs: blue = Sucursal, orange = FoodTruck), city, active state, and actions: "Ver detalle" (`routerLink` to `/branches/:id`), edit, activate/deactivate. Filters: `q` text input, active-state select, and the tenant combobox — the combobox renders only for `sysadmin` (for `admin`/`owner` the scope is their own tenant; the existing `GET /api/tenants` already returns only their tenant).

**Rationale**: cards communicate the branch type visually (restaurant vs foodtruck) and scale to touch/POS-style UIs; hiding the tenant filter for tenant managers removes a control that can only ever select their own tenant.

### 5. Detail screen at `/branches/:id` with tabbed sections
New `views/branch-detail/branch-detail.component` loads the branch via `getById`, shows an edit form (name, type, address, city, phone, active) and a tab bar: "Configuración" (the form) + placeholder tabs "Menú", "Mesas", "Horarios", "Ajustes" rendering an empty state. Back button navigates to `/branches`.

**Rationale**: a tabbed layout lets future features land without re-routing; placeholders make the structure visible without faking functionality.

### 6. Frontend role gating via a generalized guard
The existing `sysadmin.guard.ts` is generalized into a `roleGuard` accepting allowed roles (or a new `managerGuard` for sysadmin/admin/owner); both `/branches` and `/branches/:id` routes use it, and the nav item gains `roles: ['sysadmin', 'admin', 'owner']` (the `roles` filter already exists in `DefaultLayoutComponent` from the prior change). The tenants-list "Sucursales" button stays visible to all roles (backend enforcement protects `cashier`).

**Rationale**: the backend remains the enforcement point; the guard only improves UX. `cashier` will hit 403 on the API if it ever reaches the screen.

## Risks / Trade-offs

- [Cross-tenant read/write leak in update/get flows] → ownership checks in the service before every mutation/read; covered by curl validation tasks.
- [Frontend filter `q` requires backend support] → `q` implemented in the repository as a case-insensitive regex on `name`; escaped against regex injection.
- [Detail screen 403/404 for tenant managers on foreign branches] → API returns 403 (scoping) and the screen shows an error state; navigation to foreign ids is only possible via manual URL entry.
- [Card grid hurts information density vs the table] → accepted: cards are the product's chosen representation; contact fields remain editable in the detail screen.
- [Guard generalization touches a shared file] → `sysadmin.guard.ts` is currently unused (per prior change tasks); replacing it has no active consumers.

## Migration Plan

- No data migration. Deploy backend (new middleware + route changes), then frontend (new routes, redesigned list). Rollback: revert the route/middleware changes and the frontend components; no schema effects.
