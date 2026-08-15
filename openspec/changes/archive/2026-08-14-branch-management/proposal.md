## Why

The `branches` collection exists in the data model (migration 003) with `tenantId`, `name`, `type`, and `active`, but there is no API or UI to create, assign, or manage branches (sucursales / foodtrucks). Sysadmins need a dedicated screen to create branches and assign them to tenants; other roles must not access branches at all.

## What Changes

- New API `/api/branches`: `GET` (list, filterable by `tenantId` and `active`), `POST` (create with required `tenantId`), `PUT /:id` (update, including reassignment to another tenant). All endpoints restricted to `sysadmin` — no other role can read or write branches.
- Branch document gains optional `address`, `city`, and `phone` fields (MongoDB is schemaless; no migration required).
- No delete endpoint: deactivation via `active: false` (consistent with the tenants philosophy; future `orders.foodtruckId` references stay valid).
- New dedicated "Sucursales" screen in `frontend-admin` with a tenant combobox that filters the branch list and drives tenant assignment; route and nav item visible only to `sysadmin`.
- `GET /api/tenants` includes a `branchCount` per tenant, and the tenants list shows it plus a per-row "Sucursales" button navigating to the branches screen with that tenant preselected. In this MVP the navigation is open to all roles (backend stays sysadmin-only; role-based frontend access deferred).
- `AuthUser` interface in the frontend gains `role` and `tenantId` (already returned by `/api/auth/me`).

## Capabilities

### New Capabilities
- `branch-management`: sysadmin-only branch CRUD — list with tenant/active filters, create with tenant assignment, update (including reassignment and activation/deactivation), no delete.

### Modified Capabilities
- `tenant-data-model`: the `branches` collection schema gains optional `address`, `city`, and `phone` fields.

## Impact

- Backend: new `validation/branchSchemas.js`, `repositories/branchRepository.js`, `services/branchService.js`, `controllers/branchController.js`, `routes/branches.js`; `server.js` mounts the router at `/api/branches`.
- Frontend: new `services/branches.service.ts`, `auth/sysadmin.guard.ts`, `views/branches/branches.component.{ts,html}`; `auth.service.ts` (AuthUser fields), `app.routes.ts` (lazy route + guard), `_nav.ts` and `default-layout.component.ts` (role-filtered nav item).
- No schema or migration changes; no changes to existing tenants/users/auth APIs.
