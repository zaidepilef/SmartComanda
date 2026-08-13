## Why

The `role` field exists in the data model (tenant-data-model spec) but no layer of the system writes or reads it: the users API strips it at validation (zod), the model does not persist it, and the admin screen does not know it exists. SmartComanda's admin is a single global `sysadmin` who creates users from the admin screen and must assign each user a role (owner/admin/cashier) and a tenant. Without roles in the API and UI, the multi-tenant model cannot be operated.

## What Changes

- **Migration `004` (backfill de roles):** assigns `role: sysadmin` to the account configured via `SYSADMIN_EMAIL` (default `fel.di.rod@gmail.com`) and `role: owner` to the existing active users (ana, luis, maria). No `tenantId` is backfilled — the sysadmin assigns tenants later from the screen.
- **Users API (`/api/users`):** accepts and persists `role` (enum `sysadmin`/`owner`/`admin`/`cashier`) and optional `tenantId` (must reference an existing tenant when provided). Management endpoints restricted to `sysadmin` role.
- **Tenants API:** minimal `GET /api/tenants` (list) so the admin screen can build the tenant selector. No full CRUD in this change.
- **Admin frontend (`users` view):**
  - Table gains a role column with colored badges.
  - New create-user form (currently the screen cannot create users) with role select (only `owner`/`admin`/`cashier` — sysadmin is not creatable from the screen) and tenant select.
  - Edit form gains role and tenant selects.
- `SYSADMIN_EMAIL` env var documented in `.env`/docs.

## Capabilities

### New Capabilities
- `tenant-management`: Minimal tenants read capability — the API lists tenants so the admin UI can assign users to a tenant; covers the migration-created `tenants` collection.

### Modified Capabilities
- `users`: The user entity and API now include `role` and `tenantId`; user management is restricted to the `sysadmin` role; a backfill migration assigns initial roles to existing users.

## Impact

- `backend/src/migrations/004_backfill_user_roles.js` (new migration with backfill, reads `SYSADMIN_EMAIL`).
- `backend/src/validation/userSchemas.js` (`role`, `tenantId`), `backend/src/models/user.js` (role constants, persistence), `backend/src/controllers/userController.js`, `backend/src/services/userService.js`, `backend/src/repositories/userRepository.js` (sysadmin guard), `backend/src/routes/users.js`.
- New `backend/src/routes/tenants.js`, controller, service, repository for `GET /api/tenants` (auth required).
- `backend/src/config/env.js` (`SYSADMIN_EMAIL`).
- Frontend: `user.service.ts` (types), `tenants.service.ts` (new), `users.component.ts/html` (badge, create form, selects).
- No docker-compose changes. Existing data: only additive field updates in migration 004.