## 1. Backend: tenants API

- [x] 1.1 Add `createTenantSchema` and `updateTenantSchema` to `validation/tenantSchemas.js`: `name` required, `rut` with lax regex `/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/`, `razonSocial`, `active` (default true); update allows partial fields.
- [x] 1.2 Extend `tenantService`: `createTenant(input)` and `updateTenantById(id, input)` using the repository; `listTenants` gains per-tenant `userCount` via a single aggregation ($lookup users on `tenantId`, $size, $project).
- [x] 1.3 Extend `tenantController`: `createTenant` (201) and `updateTenant` (200) with error mapping 400/404/409 (ConflictError on duplicate `rut`).
- [x] 1.4 Apply `requireSysadmin` to `POST`/`PUT` in `routes/tenants.js`; leave `GET` authenticated-only. No DELETE route.
- [x] 1.5 Verify via curl: create (201), duplicate rut (409), bad payload (400), update (200), update nonexistent (404), non-sysadmin write (403), DELETE → 404, list includes `userCount`.

## 2. Frontend: shared service and tenants view

- [x] 2.1 Move `tenants.service.ts` to `app/services/` (add `userCount: number` to `Tenant`), update the users component import, keep the tenant selector working.
- [x] 2.2 Create `views/tenants/tenants.component.ts` following the users-view pattern: list, loading/error state, create/edit inline form with `name`, `rut`, `razonSocial`, `active` checkbox.
- [x] 2.3 Create `views/tenants/tenants.component.html`: table (name, RUT, razón social, active badge, user count, actions), "Nuevo tenant" button, inline form panel.
- [x] 2.4 Register route `/tenants` in `app.routes.ts` and nav item in `_nav.ts`.

## 3. Verification

- [x] 3.1 `ng build` passes.
- [x] 3.2 Create and edit a tenant from the UI; confirm it appears in the users-view tenant selector.
- [x] 3.3 Confirm no delete action exists anywhere in the tenants view or API.
- [x] 3.4 `openspec validate` passes for the change.