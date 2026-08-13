## Context

The tenants stack exists as read-only: `GET /api/tenants` with auth, list + `findTenantById` in the repository (the latter already used to validate `tenantId` when creating users), unique index on `rut`, `active` field in the collection. The admin has a users view whose tenant selector consumes this API, and no tenant management UI. See proposal.md for motivation; see specs/tenant-management/spec.md for the requirements.

## Goals / Non-Goals

**Goals:**
- Complete the tenants API with create/update (sysadmin-only writes), keep reads authenticated.
- Per-tenant user counts in the list response.
- New admin view for tenants following the users-view pattern (inline forms, badges).
- No delete of any kind — creation and edition only.

**Non-Goals:**
- No DELETE endpoint and no soft-delete flow (explicit decision).
- No Chilean RUT digit-verifier validation.
- No pagination for tenants (small expected counts).
- No changes to the tenant data model or migrations.

## Decisions

**1. No deletion, no soft-delete**
`POST` + `PUT` only. `active` is a plain editable field in the form, not a deactivation action. Rationale: tenants are referenced by users, branches, and orders; removal semantics belong to a future lifecycle decision. A `DELETE` request simply 404s (no route).
- Alternative considered: soft delete via dedicated toggle action. Rejected — user decision: keep the mantenedor to create/edit only.

**2. User count via aggregation, not N queries**
`GET /api/tenants` runs one aggregation: match filter → sort by name → `$lookup` users on `tenantId` → `$addFields` with `$size` → `$project` to drop the joined array. One round-trip regardless of tenant count.
- Alternative considered: `countDocuments` per tenant (N queries). Rejected — unbounded.
- Alternative considered: separate endpoint `/api/tenants/:id/users/count`. Rejected — the list screen wants the count in the same payload.

**3. RUT: lax format regex only**
`z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)` on create/update. No DV algorithm (over-engineering for an informational field). Duplicate RUT surfaces as HTTP 409 via the existing unique index (`ConflictError`).
- Alternative considered: strict DV validation. Rejected — user decision.

**4. Write authorization mirrors the users pattern**
`requireSysadmin` (existing middleware) applied to `POST`/`PUT`; `GET` stays open to any authenticated user because the users-view selector needs it.
- Alternative considered: tenant writes open to owners of that tenant. Rejected — owners cannot log into this admin app yet (established in add-user-roles-management).

**5. Frontend: shared service + new view**
- Move `tenants.service.ts` from `views/users/` to `app/services/` (one source of truth for both views). The users component updates its import; behavior unchanged.
- New `views/tenants/tenants.component` with: table (name, RUT, razón social, active badge, user count, acciones), "Nuevo tenant" button, inline create/edit form (pattern of the users view), reusing the same error/saving state pattern.
- Route `/tenants` in `app.routes.ts` and a nav item in `_nav.ts` (icon: `cil-building` if present in the icon subset, else a similar one).
- `Tenant` type gains `userCount: number`.
- Alternative considered: modal forms. Rejected — the users view already establishes the inline-panel pattern; consistency wins.

## Risks / Trade-offs

- **`userCount` is computed at read time** — no denormalization; fine at current scale, revisit if lists grow.
- **RUT regex is lax** — malformed-but-format-compliant RUTs (e.g., wrong DV) pass. → Mitigation: accepted by decision; informational field.
- **No delete can strand obsolete tenants** — tenants never leave the list. → Mitigation: `active: false` hides them from assignment selectors (users view requests `active=true`); the mantenedor shows all.
- **Aggregation projection** — `$lookup`+`$size` keeps memory bounded by result set; trivial at expected scale.

## Migration Plan

1. Backend: extend `tenantSchemas.js` (create/update + RUT regex), `tenantService` (create/update/user counts), `tenantController` (map 400/404/409), `routes/tenants.js` (`requireSysadmin` on writes).
2. Verify API via curl: 201 create, 200 update, 409 duplicate RUT, 400 bad payload, 403 non-sysadmin, 404 update nonexistent, 404 DELETE, `userCount` in list.
3. Frontend: move service, build tenants view, wire route + nav, keep users selector working.
4. Verify: `ng build` passes; create a tenant from the UI and see it in the users-view selector.

**Rollback:** Remove the new routes/validation changes; revert frontend. No data changes — the collection already exists.