## Context

The backend runs versioned MongoDB migrations at startup (`src/db/migrations.js`) and the users API (`/api/users`) currently validates with zod schemas that strip unknown fields — `role` and `tenantId` never reach the model. The admin frontend (`users` view) has no create-user form and its `User` type has no role/tenant fields. See proposal.md for motivation; see specs for the requirements.

## Goals / Non-Goals

**Goals:**
- Full-stack role support: backfill roles, persist `role`/`tenantId` through the users API, expose a minimal tenants list, and operate it from the admin screen.
- Keep `sysadmin` single and environment-configured (`SYSADMIN_EMAIL`), never creatable from the UI.
- Follow existing layers: controllers → services → repositories, zod validation, versioned migrations.

**Non-Goals:**
- No full tenant CRUD (create/edit/delete tenants) — only listing in this change.
- No per-tenant authorization scoping for owners/admins/cashiers (they cannot log into this admin app yet).
- No branch or order management screens.
- No enforcement of "owner/admin/cashier must belong to a tenant" at the DB level — `tenantId` stays optional in documents; legacy users keep no tenant until assigned from the screen.

## Decisions

**1. Backfill via migration `004_backfill_user_roles.js` (data migration)**
Assigns roles to existing users once: `SYSADMIN_EMAIL` (env, default `fel.di.rod@gmail.com`) → `sysadmin`; all other existing users → `owner`. No `tenantId` backfill (per decision) — the sysadmin assigns tenants from the screen afterward. The migration is idempotent: it only updates users that have no `role`.
- Alternative considered: manual mongosh update. Rejected — not reproducible.
- Alternative considered: auto-promoting the first active user at startup. Rejected — implicit and ambiguous.

**2. `SYSADMIN_EMAIL` in env config**
Read in `src/config/env.js` with a default of `fel.di.rod@gmail.com`; documented in `.env`/README so environments can pin their own sysadmin. The migration and the sysadmin guard read from the same config.

**3. Users API: role + tenantId**
- `createUserSchema`/`updateUserSchema` gain `role` (zod enum of the four roles) and `tenantId` (optional, validated as a Mongo ObjectId; when provided, the service checks the tenant exists — HTTP 400 otherwise).
- `models/user.js` adds `USER_ROLES` constants and persists `role`/`tenantId`/`name` in `toUserDocument`.
- The public registration endpoint (`/api/auth/register`) does NOT accept `role`/`tenantId` — registration stays role-less; the sysadmin assigns roles later.
- Alternative considered: letting registration accept roles. Rejected — public registration must never self-assign privileges.

**4. Sysadmin-only guard for user management**
New middleware `requireSysadmin` (after `authRequired`) checks `req.user.role === "sysadmin"` on POST/PUT/DELETE `/api/users`; GET (list/read) stays open to any authenticated user. The JWT payload does not carry the role, so the middleware looks up the user from the DB (the request already has `req.user` from `authRequired`).
- Alternative considered: embedding role in the JWT. Rejected — role changes would require token re-issue; DB lookup on write operations is cheap.

**5. Tenants read API**
New minimal stack following existing patterns: `routes/tenants.js` (authRequired), `controllers/tenantController.js`, `services/tenantService.js`, `repositories/tenantRepository.js`. `GET /api/tenants?active=true` filters by `active`. No other CRUD.

**6. Admin frontend**
- `user.service.ts`: `UserRole` type (`'sysadmin' | 'owner' | 'admin' | 'cashier'`), `role`/`tenantId` on `User`, role in `UserUpdatePayload`/create payload; labels/badges maps (sysadmin→dark, owner→primary, admin→info, cashier→secondary).
- New `tenants.service.ts` (list) and `Tenant` type.
- `users.component.ts/html`:
  - Role column with badge in the table; sysadmin row shows a badge too (informative).
  - New create-user form (firstName, lastName, email, password, status, role select with only owner/admin/cashier, tenant select from `tenants.service`).
  - Edit form gains role and tenant selects.
- The role select never offers `sysadmin`; the single sysadmin comes from the backfill/env.
- Alternative considered: offering all four roles. Rejected — user confirmed a single sysadmin fixed by env.

## Risks / Trade-offs

- **Legacy users without tenantId** — owner/admin/cashier without tenant violate the data model intent until assigned. → Mitigation: accepted by decision; the admin screen makes assignment explicit with the tenant select.
- **Migration 004 depends on env at runtime** — if `SYSADMIN_EMAIL` changes later, the backfill won't re-run (already recorded). → Mitigation: the guard middleware also reads the env, so the sysadmin identity stays consistent; changing the env only changes who can manage (a deliberate operational choice).
- **User with no role** — users created before this change have no role; the sysadmin guard would block them from management (safe default). → Mitigation: backfill covers all pre-existing users; new users always get a role from the create form.
- **Tenants list grows** — no pagination for now; fine for the expected small tenant counts. → Mitigation: revisit if tenant count grows.

## Migration Plan

1. Backend: add `SYSADMIN_EMAIL` to env config → implement migration 004 → extend schemas/model/service/repo → add `requireSysadmin` → add tenants read stack → mount routes.
2. Verify API: login as sysadmin (`fel.di.rod@gmail.com`), create user with role+tenant, confirm 403 for non-sysadmin on write, confirm 400 for invalid role/tenant, confirm `GET /api/tenants`.
3. Frontend: update types → tenants service → badge column → create form → edit form.
4. Manual E2E in the admin screen: create user with role owner + tenant, see badge, edit role/tenant, restart to confirm migration idempotency.

**Rollback:** Remove migration record `004` and reset `role` on affected users; revert API guard; revert frontend changes. Additive schema — no data destruction.

## Open Questions

None — all scope decisions were resolved with the user during exploration (tenant assignment per user, single env-configured sysadmin, badge + select, backfill scope).