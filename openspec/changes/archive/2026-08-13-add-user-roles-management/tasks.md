## 1. Backend: roles backfill

- [x] 1.1 Add `SYSADMIN_EMAIL` to `backend/src/config/env.js` with default `fel.di.rod@gmail.com` and document it in `.env`/README.
- [x] 1.2 Create `backend/src/migrations/004_backfill_user_roles.js`: assign `role: sysadmin` to the user whose email equals `SYSADMIN_EMAIL` and `role: owner` to the other users that have no `role`; skip users that already have a role (idempotent).
- [x] 1.3 Verify manually: restart backend, confirm log `Running migration 4: 004_backfill_user_roles.js`, and via mongosh that `fel.di.rod@gmail.com` has `role: sysadmin` and the other users have `role: owner`.

## 2. Backend: users API with role and tenantId

- [x] 2.1 Add `USER_ROLES` constants to `backend/src/models/user.js` and persist `role`, `tenantId`, and `name` in `toUserDocument`.
- [x] 2.2 Extend `createUserSchema` and `updateUserSchema` with `role` (enum of the four roles) and `tenantId` (optional ObjectId).
- [x] 2.3 In `userService`, when `tenantId` is provided, verify the tenant exists (otherwise return HTTP 400).
- [x] 2.4 Create `requireSysadmin` middleware (after `authRequired`) and apply it to POST/PUT/DELETE `/api/users` (GET stays open to any authenticated user).
- [x] 2.5 Confirm `/api/auth/register` does NOT accept `role`/`tenantId` (public registration stays role-less).

## 3. Backend: tenants read API

- [x] 3.1 Create `tenantRepository`, `tenantService`, and `tenantController` following existing layer patterns, with `GET /api/tenants` (authRequired) supporting `?active=true` filtering.
- [x] 3.2 Mount the tenants router in `server.js`.
- [x] 3.3 Verify via curl/Postman: 401 without token, 200 list with token, filtered by `active`.

## 4. Frontend: types and services

- [x] 4.1 Add `UserRole` type, `role`/`tenantId` fields, and role in update/create payloads to `user.service.ts`.
- [x] 4.2 Create `tenants.service.ts` with `Tenant` type and a `list()` method.
- [x] 4.3 Add role label and badge maps (sysadmin/owner/admin/cashier) in `users.component.ts`.

## 5. Frontend: users view

- [x] 5.1 Add role column with badges to the users table.
- [x] 5.2 Add a create-user form (firstName, lastName, email, password, status, role select with only owner/admin/cashier, tenant select) that POSTs to `/api/users`.
- [x] 5.3 Add role and tenant selects to the edit form, and send them on save.
- [x] 5.4 Verify E2E in the admin screen: create user with role+tenant, badge shown, edit role/tenant, and confirm `sysadmin` never appears as a creatable option.

## 6. Verification

- [x] 6.1 `openspec validate` passes for the change.
- [x] 6.2 API smoke test: login as sysadmin, create user with role+tenant (201), invalid role/tenant (400), write as non-sysadmin (403).
- [x] 6.3 Restart backend twice: migration 004 runs once and is not re-applied.