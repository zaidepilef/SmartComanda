## 1. Scope and authorization helper

- [x] 1.1 Create `backend/src/utils/tenantScope.js` with `isGlobalActor(actor)`, `getTenantFilter(actor)`, `canManageUser(actor, targetUser)`, and `assertUserPayloadScoped(actor, payload)` following design.md - Decisions 2
- [x] 1.2 Verify the helper with a quick node smoke test (sysadmin vs admin vs cashier/owner matrix, sysadmin-target and cross-tenant rejections)

## 2. Repository tenant filters

- [x] 2.1 Extend `userRepository.listUsers` to accept an optional `tenantId` in the filter (used by `getTenantFilter`)
- [x] 2.2 Extend `tenantRepository.listTenants` to support restricting the result to a single tenant id
- [x] 2.3 Keep `userCount` global per tenant (count over all users referencing the tenant) and confirm no other repo change is needed

## 3. Service layer actor-awareness

- [x] 3.1 Refactor `userService.listUsersPaginated` to accept `{ actor, ...query }` and apply `getTenantFilter(actor)`
- [x] 3.2 Refactor `userService.getUser` to accept `actor` and return 403 (`ForbiddenError`) when a non-sysadmin requests a user outside its tenant or a sysadmin user
- [x] 3.3 Refactor `userService.createUserWithPassword` to accept `actor`: `admin` payloads pass `assertUserPayloadScoped` (no `role: sysadmin`, no foreign `tenantId`) and default `tenantId` to the actor's own tenant when omitted; non-sysadmin/non-admin actors get 403
- [x] 3.4 Refactor `userService.updateUserById` to accept `actor`: enforce `canManageUser(actor, existing)` (403) and `assertUserPayloadScoped` on the payload (403)
- [x] 3.5 Enforce in `userService.deleteUserById` that only `sysadmin` may delete (403 otherwise), keeping the existing 404 path
- [x] 3.6 Refactor `tenantService.listTenants` to accept `actor`: non-sysadmin actors get only their own tenant (single result or empty list)

## 4. Controllers and routes

- [x] 4.1 Update `userController` and `tenantController` to pass `req.user` as `actor` into the refactored service functions
- [x] 4.2 Create `backend/src/middleware/requireSysadminOrAdmin.js` (role gate for POST/PUT users)
- [x] 4.3 Update `backend/src/routes/users.js`: `GET` routes stay auth-only, `POST`/`PUT` use `requireSysadminOrAdmin`, `DELETE` keeps `requireSysadmin`
- [x] 4.4 Update `backend/src/routes/tenants.js`: `GET` stays auth-only (scoping in service); `POST`/`PUT` unchanged

## 5. JWT claims

- [x] 5.1 Add `role` and `tenantId` (omitted when absent) claims to `authService.issueToken`
- [x] 5.2 Confirm `authRequired` still authorizes solely from the database-loaded user (no behavior change expected)

## 6. Verification

- [x] 6.1 Manual API pass with curl/Postman: sysadmin lists all users/tenants; admin lists/creates/edits/alta-baja only its tenant; cashier/owner read-only scoped; cross-tenant and sysadmin-target reads/writes return 403; DELETE by non-sysadmin returns 403
- [x] 6.2 Verify login response includes `role`/`tenantId` in the JWT payload and that the public user profile already carries `tenantId`
- [x] 6.3 Regression check: sysadmin flows (tenant creation/update, user management) unchanged
