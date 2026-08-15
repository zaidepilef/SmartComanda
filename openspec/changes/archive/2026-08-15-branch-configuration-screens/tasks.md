## 1. Backend: role expansion and tenant scoping

- [x] 1.1 Create `backend/src/middleware/requireManager.js` allowing `sysadmin`, `admin`, and `owner` (403 otherwise), mirroring `requireSysadmin.js`
- [x] 1.2 Make `branchService` actor-aware: `listBranches(actor, { tenantId, active, q })` forcing `tenantId = actor.tenantId` for non-global actors via `getTenantFilter`; `createBranch(actor, input)` and `updateBranchById(actor, id, input)` rejecting cross-tenant assignment with `ForbiddenError`; `getBranchById(actor, id)` rejecting foreign branches for non-global actors
- [x] 1.3 Add `q` support to `branchRepository.listBranches` as an escaped case-insensitive regex on `name` (guard against regex injection)
- [x] 1.4 Update `branchController` to pass `req.user` into the service and add `getBranch` handler
- [x] 1.5 Update `routes/branches.js`: swap `requireSysadmin` for `requireManager`, add `GET /:id` route, extend `listBranchesQuerySchema` with `q` (optional string)
- [x] 1.6 Validate with curl: `admin`/`owner` list only their own tenant; cross-tenant create/update/get → 403; `sysadmin` global; `cashier` → 403; `q` filter works; `GET /:id` 200/403/404

## 2. Frontend: branch service and role guard

- [x] 2.1 Add `getById(id)` to `frontend-admin/src/app/services/branches.service.ts` and `q` to the `list` query builder
- [x] 2.2 Generalize `frontend-admin/src/app/auth/sysadmin.guard.ts` into a role-based guard accepting allowed roles (e.g., `roleGuard(['sysadmin','admin','owner'])`), preserving the await-`me()` behavior

## 3. Frontend: card-based branch list

- [x] 3.1 Redesign `views/branches/branches.component.ts`: replace table state with card grid state; add `q` search signal, active-state filter signal, and sysadmin-only tenant combobox
- [x] 3.2 Redesign `views/branches/branches.component.html`: responsive card grid with type badges (Sucursal blue / FoodTruck orange), city, active state, and per-card actions "Ver detalle" (→ `/branches/:id`), edit, activate/deactivate; keep create form and empty/loading states
- [x] 3.3 Add `roles` to the "Sucursales" nav item in `frontend-admin/src/app/layout/default-layout/_nav.ts`

## 4. Frontend: branch detail screen

- [x] 4.1 Create `views/branch-detail/branch-detail.component.ts` loading the branch via `getById` (with error states for 403/404), holding an edit form and tab state
- [x] 4.2 Create `views/branch-detail/branch-detail.component.html` with back button, edit form (name, type, address, city, phone, active), and tab bar "Configuración" + placeholder tabs "Menú", "Mesas", "Horarios", "Ajustes" with empty states
- [x] 4.3 Register lazy routes `/branches` and `/branches/:id` in `app.routes.ts` with the role guard (sysadmin/admin/owner)

## 5. Validation

- [x] 5.1 Run `npm run build` in `frontend-admin` and confirm compilation
- [x] 5.2 Start backend and re-run the endpoint matrix from task 1.6 against a fresh token set (sysadmin, owner, admin, cashier)
- [x] 5.3 Manual UI pass: card rendering, filters, navigation to detail, edit + save, and role blocking for `cashier`
