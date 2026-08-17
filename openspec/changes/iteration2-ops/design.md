## Context

See proposal.md - Why. Current state: iteration 1 (`pos-frontend-v1`) delivered paid orders with sequential numbering, open cash sessions, and relaxed catalog access. Orders have `status` (default `pending`), `paymentStatus`, `paymentMethod`, `orderType`, `number`, and item snapshots. The user record carries `tenantId` but **no branch**: the POS selects the branch client-side and always passes `branchId` explicitly. The admin already has a users view with editing. Backend is Express + single-node MongoDB (no transactions). frontend-pos mirrors the admin's service/guard patterns.

## Goals / Non-Goals

**Goals:**
- Close cash sessions with a per-method cash-out count (arqueo), final snapshot, and difference.
- Order listing with filters for the admin panel and the KDS, scoped by role.
- Kitchen lifecycle (`new → preparing → ready → delivered` + `cancelled`) with a polling KDS screen.
- Printable receipt rendered client-side from the order response.

**Non-Goals:**
- Mercado Pago, product modifiers, multi-node Mongo transactions, websocket/SSE push (polling is enough at foodtruck scale), order editing after creation, refunds.

## Decisions

### 1. Cashier branch scoping via `user.branchId`
The order-listing spec requires a cashier's listing to be scoped to "their branch" without a branch param — the backend must know which branch a cashier operates. The user record gains an optional `branchId` (validated to belong to the user's tenant), assigned in the existing admin users view. Backend scoping rules:
- `cashier`: listings and status updates are hard-scoped to `user.branchId` (a branch filter different from it is rejected/ignored; no assignment → 400 with a clear message). KDS/status updates keep working because the POS always sends the assigned branch.
- `admin`/`owner`: tenant-scoped, branch filter optional.
- `sysadmin`: any tenant via `tenantId`.
- Alternative considered: forcing a `branchId` param on cashier listings. Rejected: it lets a cashier read any of their tenant's branches (broader than "own branch") and pushes policy to the client.

### 2. Session close as a guarded single update
`POST /api/cash-sessions/:id/close` accepts optional `closingAmounts` per method. The service resolves the session by `_id` scoped to the actor's tenant (404 otherwise) and performs a single `findOneAndUpdate` with filter `{_id, status: "open"}` and `$set` of `status: "closed"`, `closedAt`, `closedBy`, `closingAmounts` (defaults to the recorded totals), `difference` per method (`closingAmount - totals.<method>`). A zero-match means it was already closed → 409. No transactions; the update is atomic and idempotent under double-submit.
- Alternative considered: check-then-update in two steps. Rejected: racy under double-click.
- `difference` is signed; a negative difference means the count came up short.

### 3. Status lifecycle with a whitelist and history
Transitions: `new → preparing`, `preparing → ready`, `ready → delivered`, and `cancelled` from `new`/`preparing`. `PATCH /api/orders/:id/status` validates the transition in the service (409 otherwise) and persists `status`, `updatedAt`, and appends `{status, at, by}` to `statusHistory` (audit trail, cheap on single-node Mongo). Migration 008 maps existing `pending` orders to `new` and adds `statusHistory` where missing.
- Alternative considered: free-form status field. Rejected: kitchen and POS must agree on a fixed lifecycle.

### 4. Order listing: paginated, newest first
`GET /api/orders` with query filters `branchId`, `status`, `orderType`, `paymentStatus`, `paymentMethod`, `from`, `to`, `q` (matches order number or client contact), plus `limit` (default 50, max 200) and `offset`. Sorted `createdAt` desc. Migration 008 adds indexes `{tenantId, foodtruckId, createdAt: -1}` and `{status}` to keep common queries efficient.
- Alternative considered: cursor pagination. Overkill; the admin table and KDS poll don't need stable cursors at this scale.

### 5. KDS via polling, not push
The KDS screen polls `GET /api/orders?branchId=&limit=50` every 10 seconds, groups locally by status, and advances with `PATCH`. Elapsed time is computed client-side from `createdAt`.
- Alternative considered: SSE/WebSocket from the API. Rejected: adds infra (connections, reconnects) for a single-screen kitchen; polling is stateless and fits the existing n8n/HTTP posture.

### 6. Receipt rendered client-side, printed via `@media print`
The receipt is a component fed by the order creation response + the branch from the store (spec: receipt data provenance). Printing uses `window.print()` with a `@media print` stylesheet that hides everything except the receipt area (80mm thermal-friendly, monospace totals).
- Alternative considered: server-side PDF/HTML receipt. Rejected: no backend involvement required by the spec; browser print is zero-infra.

## Risks / Trade-offs

- [`user.branchId` can be stale after branch reassignment] → Only used for scoping; reassigning is a single admin edit; orders store their own `foodtruckId` snapshot.
- [Close is a single write; a concurrent order could land after the close] → The close records `totals`/`orderCount` at the moment of update; the paid-order flow already asserts an open session first, so an order racing the close gets the 409 gate and can be retried after reopening.
- [KDS polling latency (up to 10s)] → Acceptable for kitchen throughput; interval can be lowered per deployment.
- [Offset pagination can skip/duplicate rows while new orders arrive] → Cosmetic for an admin table; sorting by `createdAt desc` keeps the newest at the top.

## Migration Plan

1. Backend first: user `branchId` (schemas + model + service), order listing + status endpoints, session close. Additive; existing requests unaffected.
2. Migration 008: `orders` indexes, `pending → new` status normalization, `statusHistory` initialization.
3. Admin: users view branch select; new orders view.
4. POS: KDS route, cash close flow, receipt.
5. Rollback: stop `angular_pos`/hide admin orders view; backend changes are additive (new optional fields, new endpoints). Migration 008 is forward-only; `pending → new` is safe (iteration 2 treats them equivalently on the KDS).
