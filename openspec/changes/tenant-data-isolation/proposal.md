## Why

Today the API enforces authentication but not tenant isolation: any authenticated user — including a `cashier` — can read every user and tenant in the system via `GET /api/users` and `GET /api/tenants`. The tenant data model exists (`users.tenantId`, `tenants`, `branches`, `orders`), but there is no enforcement layer, exposing cross-tenant data (OWASP A01 Broken Object Level Authorization). A user with a `tenantId` must only see data from its own tenant; only `sysadmin` operates globally.

## What Changes

- Tenant scoping on all user reads: `GET /api/users` and `GET /api/users/:id` return only users of the requester's tenant, except for `sysadmin` who sees all.
- Tenant scoping on tenant reads: `GET /api/tenants` returns only the requester's own tenant, except for `sysadmin` who sees all.
- Cross-tenant access to a specific resource responds with HTTP 403.
- `admin` role gains write access to users **within its own tenant** (create, update, alta/baja via status), while `sysadmin` keeps global user management. `owner` and `cashier` remain read-only within their tenant.
- Anti-escalation rules: an `admin` cannot assign/change the `sysadmin` role, cannot change a user's `tenantId`, and cannot operate on users outside its tenant.
- JWT gains `role` and `tenantId` claims (authority stays in the database — `authRequired` keeps reloading the user per request; claims are UI convenience only).
- `userCount` semantics on tenant reads remain unchanged (computed on the full user set).

## Capabilities

### New Capabilities
- `tenant-data-isolation`: the enforcement policy — tenant-scoped reads, 403 on cross-tenant access, and the role matrix for user management.

### Modified Capabilities
- `users`: user read endpoints become tenant-scoped; the `admin` role is allowed to create/update/activate/deactivate users within its own tenant, with anti-escalation constraints.
- `tenant-management`: `GET /api/tenants` becomes tenant-scoped for non-sysadmin users.
- `user-auth`: the issued JWT includes `role` and `tenantId` claims.

## Impact

- Backend: `backend/src/services/userService.js` (actor-aware signatures), `backend/src/controllers/userController.js`, `backend/src/routes/users.js` and `routes/tenants.js` (route guards), `backend/src/services/authService.js` (JWT claims), `backend/src/repositories/userRepository.js` and `tenantRepository.js` (tenant filters), possibly a new scope/authorization helper under `backend/src/utils` or `middleware`.
- No schema or migration changes; `tenantId`/`role` fields already exist.
- API behavior changes for non-sysadmin clients (responses now scoped); frontend `frontend-admin` may decode the new JWT claims to build role/tenant-aware UI but no frontend behavior is required by this change.
- No breaking changes for `sysadmin` flows.
