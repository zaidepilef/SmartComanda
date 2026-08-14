## Why

Tenants exist in the data model and the users screen assigns them, but the sysadmin has no way to create or edit them: the API only lists (`GET /api/tenants`). A tenant manager (mantenedor) in the admin closes the loop — the sysadmin creates and edits tenants, and the users screen immediately offers them in the tenant selector.

## What Changes

- **Tenants API gains create and update:**
  - `POST /api/tenants` (sysadmin-only): create with `name`, `rut`, `razonSocial`, `active`.
  - `PUT /api/tenants/:id` (sysadmin-only): update those fields.
  - `GET /api/tenants` now includes a `userCount` per tenant (number of users referencing the tenant).
  - **No DELETE endpoint and no soft-delete semantics** (per decision): tenants are never removed; `active` is an ordinary editable attribute.
- **RUT validation:** lax format regex (`\d{1,2}\.\d{3}\.\d{3}-[\dkK]`), no digit-verifier check; duplicate RUT returns HTTP 409.
- **Admin frontend:** new `tenants` view (route `/tenants`, nav item) with table (name, RUT, razón social, active badge, user count) and inline create/edit form following the users-view pattern.
- `tenants.service.ts` moves from `views/users/` to a shared `services/` folder; the users view keeps using it for the tenant selector.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `tenant-management`: The tenants read API grows create/update endpoints, per-tenant user counts, a lax RUT format rule, and an explicit guarantee that tenants cannot be deleted.

## Impact

- Backend: `validation/tenantSchemas.js` (create/update schemas, RUT regex), `services/tenantService.js` (create, update, user counts), `controllers/tenantController.js` (create/update + error mapping), `routes/tenants.js` (`requireSysadmin` on writes).
- Frontend: new `views/tenants/` component, shared `services/tenants.service.ts` (moved from `views/users/`), `app.routes.ts`, `_nav.ts`, updated `users.component.ts` import.
- The users-view tenant selector keeps working (API response only gains `userCount`).
- No migration needed: the `tenants` collection and indexes already exist.