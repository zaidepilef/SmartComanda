## 1. Backend: Branch API

- [x] 1.1 Create `backend/src/validation/branchSchemas.js` with `createBranchSchema`, `updateBranchSchema`, and `listBranchesQuerySchema` (zod; `type` enum `Sucursal`/`FoodTruck`; ObjectId validation for `tenantId`)
- [x] 1.2 Create `backend/src/repositories/branchRepository.js` with `listBranches({ tenantId, active })`, `createBranch`, `updateBranch`, and `findBranchById` (mirroring `tenantRepository.js`; `branches` collection; invalid ObjectIds → `NotFoundError`)
- [x] 1.3 Create `backend/src/services/branchService.js` delegating to the repository and validating the target `tenantId` exists via `tenantRepository.findTenantById` (→ `NotFoundError`)
- [x] 1.4 Create `backend/src/controllers/branchController.js` with `listBranches`, `createBranch`, `updateBranch` using the shared `mapError`/`handleError` pattern
- [x] 1.5 Create `backend/src/routes/branches.js` mounting `authRequired` + `requireSysadmin` on `GET /`, `POST /`, and `PUT /:id` with schema validation
- [x] 1.6 Mount `branchesRouter` at `/api/branches` in `backend/src/server.js`

## 2. Frontend: AuthUser fields and sysadmin guard

- [x] 2.1 Add `role` and `tenantId` to the `AuthUser` interface in `frontend-admin/src/app/auth/auth.service.ts`
- [x] 2.2 Create `frontend-admin/src/app/auth/sysadmin.guard.ts` (`CanActivateFn` redirecting non-sysadmin users to `/dashboard`, awaiting `me()` when the profile is not yet loaded)

## 3. Frontend: Branches screen

- [x] 3.1 Create `frontend-admin/src/app/services/branches.service.ts` with `Branch`, `BranchCreatePayload`, `BranchUpdatePayload` and `list(tenantId?)`, `create`, `update`
- [x] 3.2 Create `frontend-admin/src/app/views/branches/branches.component.ts` with signals, tenant combobox (all tenants), list filtering, create/edit forms, and active toggle (mirroring `tenants.component.ts`)
- [x] 3.3 Create `frontend-admin/src/app/views/branches/branches.component.html` (table with name/type/address/city/phone/status, forms, combobox)
- [x] 3.4 Register lazy route `branches` with `canActivate: [authGuard, sysadminGuard]` and title "Sucursales" in `frontend-admin/src/app/app.routes.ts`
- [x] 3.5 Add optional `roles` to `NavItem`, add the "Sucursales" nav item (`basket` icon), and filter nav items by role in `frontend-admin/src/app/layout/default-layout/default-layout.component.ts`

## 4. Validation

- [x] 4.1 Start backend and verify branch endpoints with curl: 401 without token, 403 for non-sysadmin, 400 invalid payload, 404 nonexistent tenant/branch, 201/200 happy path, list filtering by `tenantId` and `active`
- [x] 4.2 Run `npm run build` in `frontend-admin` and confirm the app compiles

## 5. Tenant list: branch count and navigation

- [x] 5.1 Add `branchCount` to `tenantRepository.listTenants` via a second `$lookup` on the `branches` collection
- [x] 5.2 Add `branchCount` to the `Tenant` interface in `frontend-admin/src/app/services/tenants.service.ts`
- [x] 5.3 Show the branch count column and a per-row "Sucursales" button navigating to `/branches?tenantId=<id>` in `tenants.component.{ts,html}`
- [x] 5.4 Preselect the tenant combobox from the `tenantId` query param on init in `branches.component.ts` (combobox stays freely changeable)
- [x] 5.5 MVP access: remove `sysadminGuard` from the `branches` route and the `roles` filter from the nav item (backend stays sysadmin-only)
- [x] 5.6 Validate: rebuild the API container, curl `GET /api/tenants` checking `branchCount`, and run `npm run build`
