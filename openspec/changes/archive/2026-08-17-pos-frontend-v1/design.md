## Context

See proposal.md - Why. Current state: `frontend-admin` (Angular 21 standalone, signals, Tailwind) already has a minimal checkout view; the validated POS UX lives in the single-file prototype `pos.html` (dark kiosk theme, 3-column layout, payment modals). The backend orders API only supports `{foodtruckId, clientContact, items}` and marks items `stockApplied`; dish/branch listing is restricted to manager roles; the MongoDB deployment is a single node (no replica set, hence no multi-document transactions).

## Goals / Non-Goals

**Goals:**
- A dedicated `frontend-pos` Angular app that reproduces the `pos.html` UX against the real API.
- Backend support for charged orders (payment method, status, type), per-branch sequential numbers, cash sessions (open + view), branch payment methods, and dish catalog metadata.
- Read-only catalog access for `cashier`/`sysadmin` so the POS can operate.

**Non-Goals:**
- Cash session closing, order listing/management in `frontend-admin`, KDS kitchen, printed tickets, Mercado Pago, product modifiers (extras/sizes/removed ingredients).

## Decisions

### 1. New Angular app `frontend-pos` instead of extending `frontend-admin`
The POS is a full-screen kiosk: touch targets, no sidebar, custom dark theme. Fitting it into the admin shell (sidebar layout, Tailwind) would fight the validated design. A sibling app shares the API and the auth patterns (guards, services) with zero coupling.
- Alternative considered: a `/pos` route inside `frontend-admin`. Rejected: layout conflict, and the admin will get its own order-viewing spec later.
- Styling: port the `pos.html` design tokens into SCSS (`_tokens.scss` with `--bg:#1a1d22`, `--accent:#e63946`, `--accent2:#ff9f1c`, etc.). No Tailwind in the POS app; the design is a fixed dark palette, not utility-driven.

### 2. Per-branch sequential order numbers via atomic counter on the branch document
Each branch document gets a `nextOrderNumber` counter. At creation: `findOneAndUpdate({_id}, {$inc: {nextOrderNumber: 1}}, {returnDocument: "after"})` yields the order's `number` atomically — safe under concurrent creates. A unique compound index on `(tenantId, foodtruckId, number)` guards against any drift.
- Alternatives considered: counting existing orders (racy, gaps on deletes), a separate counters collection (extra indirection for no benefit).
- Trade-off: branch document carries a mutable operational field; acceptable since the branch is already a per-tenant aggregate root.

### 3. Cash sessions without multi-document transactions
MongoDB is a single node, so no transactions. The paid-order flow is sequenced to minimize inconsistency:
1. Assert an open session exists for the branch (409 otherwise).
2. Create the order (with `number`, `paymentStatus: "paid"`, `paymentMethod`, `orderType`).
3. `findOneAndUpdate` the open session with `$inc: {"totals.<method>": total, orderCount: 1}`.
If step 3 finds the session no longer open, the order stands and the missed increment is logged for reconciliation (rare: requires a concurrent close, and closing is not even exposed yet).
- Alternatives considered: updating the session first (would inflate totals if order insert then fails); transactions (unavailable on single-node Mongo).

### 4. Payment methods as a fixed enum on the branch
`paymentMethods` is a subset of `["cash","debit","credit","transfer"]`, defaulting to all four, validated with `z.enum` in the branch schemas. The POS renders only the branch's methods at checkout.
- Alternative considered: a global payment-methods table. Overkill for four fixed values; the enum can be extended later (e.g., `mercado_pago`) with a schema + data update.

### 5. Read-only catalog access without new roles
The POS needs dish/branch listing for `cashier` (and `sysadmin`). Rather than a new role, the existing listing endpoints relax their role check: `cashier` lists own-tenant active branches and own-tenant dishes (read-only); `sysadmin` lists any tenant's dishes via the existing `tenantId` query. Mutation endpoints keep the current role guards unchanged.

### 6. `frontend-pos` routing and session state
Routes: `/login` → (sysadmin) `/tenant-picker` → `/branch-picker` → `/pos` and `/cash`. Guards: `authGuard` (token) and a tenant/branch prerequisite guard. State lives in signals; `pos_token`, `pos_tenant`, and `pos_branch` persist in localStorage so a reload restores the branch context (spec: branch selection persists). Login uses the same Turnstile flow as `frontend-admin` (test key already in environments).

### 7. Docker parity with the admin app
`angular_pos` service mirrors `angular_admin`: same dev Dockerfile target, `CHOKIDAR_USEPOLLING`, bind-mount volumes, `.env` via `env_file`, port **4201**.

## Risks / Trade-offs

- [Paid order vs session increment are two writes] → Ordering above + unique order index; missed increments are detectable by comparing session `orderCount` with the branch's order count (future reconciliation, not built now).
- [`nextOrderNumber` on branch doc is a hot field] → `$inc` is atomic; contention is per-branch only (a foodtruck's throughput), no global bottleneck.
- [Relaxing listing to `cashier` widens data exposure] → Scoped strictly to own tenant and read-only; mutations keep existing guards. Covered by the POS branch/dish listing specs.
- [New payment-method enum values later (e.g., Mercado Pago)] → Backward compatible: schema allows the enum to grow; sessions `totals` object must add a key when it happens.
- [POS is a second Angular app to maintain] → Shares the API contract and auth conventions with the admin app; no shared component library yet (different design systems).

## Migration Plan

1. Backend first (order fields, branch/dish fields, cash-sessions endpoints, relaxed listing) — additive, no destructive changes; existing orders/branches/dishes remain valid (new fields optional).
2. Migration adds the `cash-sessions` collection, the orders unique index, and indexes on `cash-sessions`.
3. Deploy `frontend-pos` (Docker service on 4201) alongside the admin.
4. Rollback: stop the `angular_pos` service; backend changes are inert for the admin app (new optional fields, extra endpoints, relaxed read access). No data migration is run backward.

## Open Questions

None — decisions that could change specs, approach, or tasks were resolved with the user before proposing (payment methods per branch, order type selector, Turnstile login, sequential numbering, admin UI fields in scope).