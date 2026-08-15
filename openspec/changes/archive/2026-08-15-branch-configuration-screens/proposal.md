## Why

The branch screen shipped in `branch-management` is sysadmin-only and table-based, but the product needs `admin` and `owner` roles to configure their own branches, a card-based visualization of each branch (sucursal or foodtruck), and a dedicated detail screen per branch to evolve into the management hub (menus, tables, schedules).

## What Changes

- Backend branch API access expands from `sysadmin`-only to `sysadmin` | `admin` | `owner`, with tenant scoping: `admin`/`owner` only read and manage branches of their own tenant; `sysadmin` keeps global access.
- New `GET /api/branches/:id` endpoint (role-scoped) to support the branch detail screen.
- `GET /api/branches` gains a `q` query parameter for name search.
- Frontend `/branches` list redesign: branch cards (divs) instead of a table, visually distinct for `Sucursal` vs `FoodTruck`; filters for name search, active state, and tenant (tenant filter only meaningful for `sysadmin`).
- New `/branches/:id` detail screen with the full branch edit form plus a tab structure reserved for future sections (menu, tables, schedules, settings).
- Route and nav gating for `/branches` and `/branches/:id` restricted to `sysadmin`/`admin`/`owner`; the tenant-list "Sucursales" button remains visible to all roles (backend remains the enforcement point for `cashier`).

## Capabilities

### New Capabilities
- `branch-detail-screen`: dedicated per-branch screen with edit form and placeholder sections for future management features.

### Modified Capabilities
- `branch-management`: branch API role restriction changes from `sysadmin`-only to `sysadmin`/`admin`/`owner` with tenant scoping; `GET /api/branches/:id` added; `q` search filter added to the list.

## Impact

- Backend: new `middleware/requireManager.js`; `routes/branches.js`, `controllers/branchController.js`, `services/branchService.js` become actor-aware (scoped list, create/update forbid cross-tenant assignment); `GET /:id` route added. `requireSysadminOrAdmin` stays untouched (users module).
- Frontend: `views/branches/branches.component.{ts,html}` redesigned to a card grid with filters; new `views/branch-detail/branch-detail.component.{ts,html}`; `services/branches.service.ts` gains `getById` and `q`; `app.routes.ts` and `_nav.ts` role-gated; generalized role guard reuses the existing `sysadmin.guard.ts` pattern.
- No schema or migration changes; no breaking API changes (existing sysadmin flows keep working).
