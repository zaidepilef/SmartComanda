## Context

See proposal.md - Why. Current state: orders are created only by authenticated cashiers (`order-checkout`); `clientContact` is a free-form string; dishes carry `salePrice`, optional per-branch `branchPrices` overrides, and `active`; branches have `active` and are tenant-scoped; MongoDB is a single node (no multi-document transactions); there is no customer, loyalty, or public-read concept anywhere. `frontend-pos` (Angular 21 standalone, signals, SCSS) is the template for a new sibling app. The `qr` order type already exists and is used by POS cashiers.

## Goals / Non-Goals

**Goals:**
- A customer-facing mobile web app reachable via a printed QR per branch, capturing the customer's WhatsApp number before ordering.
- Public read-only menu API and guest order creation (`orderType: "qr"`, `paymentStatus: "pending"`).
- Points program v1: cumulative points by amount spent, configurable per tenant, awarded idempotently when the cashier charges the order.
- Admin surfaces: per-branch QR display and tenant points-rule editing. POS: phone display and "+X puntos" badge.

**Non-Goals:**
- Payment digital integration (the customer pays in person at the cash register; no Mercado Pago webhook in this change).
- Points redemption, discounts, and exclusive promotions (future iteration, blocked on accumulation data).
- WhatsApp verification (OTP) — identity is entered only, no validation, to keep zero friction; harden later alongside the real WhatsApp integration.
- In-app QR scanner (native camera handles scanning), table-tab sessions (a visit = one order), WhatsApp ordering, orders list in admin.

## Decisions

### 1. Identity: phone (WhatsApp number) without verification
The customer enters a phone; the backend upserts a `customers` document keyed by `(tenantId, phone)` (unique compound index) and attaches it to the order via `clientPhone`. No OTP in v1.
- Rationale: points require a persistent identity, and the phone aligns with the future WhatsApp integration. Verification is dropped for speed; the cash register validates identity physically at payment time.
- Risk accepted: spoofing another customer's number claims their points. Mitigated by physical presence at the counter and revisitable later with OTP without schema changes.

### 2. QR = public URL, no in-app scanner
`{PUBLIC_URL}/q/{tenantId}/{branchId}` printed per branch (admin screen). Native iOS/Android cameras open the URL directly; the frontend validates what it receives.
- The payload is public by nature (a menu is public), so no signing is needed: `tenantId` and `branchId` are opaque IDs, non-predictable, and every public endpoint re-validates that the branch exists, belongs to the tenant, and is `active`. No HMAC signature in v1 — a forged QR points at a menu that is public anyway.

### 3. Payment stays at the cash register
`POST /api/public/orders` creates the order with `paymentStatus: "pending"` and no `paymentMethod`. The existing POS charge flow marks it paid in person. Points hook rides on that existing transition — zero new payment surface.
- The order document gains `clientPhone` (string) alongside the existing free-form `clientContact` (string), so POS behavior is untouched.

### 4. Points rule: per-amount, tenant-configurable
`tenants.loyalty = { pointsPerAmount: number, currency: "CLP" }` (e.g., `1000` → 1 point per `$1000`). Earned = `floor(total / pointsPerAmount)`, only when `pointsPerAmount > 0`. Rule absence/zero → no points (feature off). Edited from the admin tenant screen; quantity is CLP (the current tenant is a sandwich shop billing in CLP; currency is informational).
- Alternative considered: fixed rule in code (rejected: per-tenant plans will differ) and per-product weighting (rejected: YAGNI for v1).

### 5. Award on payment, idempotent and transaction-free
MongoDB is single-node (no transactions), so the award is sequenced:
1. **Claim**: `findOneAndUpdate` on the order `{_id, pointsAwarded: {$ne: true}}` → `$set: {pointsAwarded: true}`. Only one concurrent charge wins the claim.
2. **Compute** `points = floor(total / pointsPerAmount)` (`pointsAwarded = true` set before granting to avoid double awards).
3. **Write**: insert `loyalty-transactions` doc (type `earn`, `sourceOrderId`) then `$inc` `customers.pointsBalance`.
If step 3 fails after the claim, the order never awards again and the failed grant is logged for reconciliation (rare: single write failure; acceptable v1).
- Only orders with `orderType: "qr"` and a valid `clientPhone` are eligible; the balance is denormalized on the customer plus an immutable ledger for audit.

### 6. Public API contract
- `GET /api/public/menu?tenantId&branchId` → `{tenancy: {businessName, branchName}, dishes: [{id, name, description, icon, category, price}]}` with price resolved by the same `branchPrices` override logic the POS uses. Only `active` dishes; no stock, recipe, or user data.
- `POST /api/public/orders` `{tenantId, branchId, phone, items: [{dishId, quantity}]}` → validates tenant/branch active + dishes owned by tenant, resolves prices server-side (never trusts client prices, same as POS), creates order `number` via the existing `nextOrderNumber` counter, returns `{number, total, pointsBalance, pointsRate}`.
- `GET /api/public/customers/balance?tenantId&branchId&phone` → current balance (shown on the success screen / re-entry).
- All public routes rate-limited and input-validated (zod), no JWT.

### 7. Session = one order per visit
No session entity. The QR visit starts a cart in memory; submitting creates the order; the success screen confirms it. Repeat visits (or reloads after submit) start fresh. Rationale: "session única" resolves to the ordering session, and the persistent link between visits is the phone (customer), not a table session. Table tabs are a future model.

### 8. `frontend-client` as a sibling Angular app
Same stack as `frontend-pos` (Angular 21 standalone, signals, SCSS), mobile-first palette, no login, no Turnstile, no guards. Route `/q/:tenantId/:branchId` loads menu; phone stored in localStorage per tenant so repeat visits skip re-entry. Docker service `angular_client` on port 4202.
- Alternative considered: adding a route to the admin app (rejected: public surface, different design, would need auth bypass).

## Risks / Trade-offs

- [Unowned phone entry can claim others' points] → Accepted for v1 (physical counter validation); OTP later via WhatsApp integration without schema change.
- [Award claim vs ledger insert are two writes] → `pointsAwarded` claim makes double awards impossible; missed grants are logged and reconcilable against `order.total` (follow-up tool).
- [Public endpoints widen the attack surface] → Read-only menu, server-side price resolution, zod validation, rate limiting, and tenant/branch ownership checks; no user data exposed.
- [Denormalized `pointsBalance` can drift from the ledger] → Ledger is immutable source of truth; balance is a cache refreshed on every earn; reconciliation script later.
- [Second Angular app to maintain] → Shares API contracts and conventions; design systems differ by intent (kiosk vs mobile consumer).

## Migration Plan

1. Backend data first: migration `009` creates `customers` (unique `tenantId`+`phone`, index on `tenantId`) and `loyalty-transactions` (indexes on `customerId`, `sourceOrderId`); no destructive changes; `orders` and `tenants` gain optional fields.
2. Backend API: public routes + loyalty services + charge hook — additive; existing admin/POS behavior unchanged (new optional fields).
3. Deploy `frontend-client` (Docker, port 4202) behind the public URL used in the QR.
4. Admin/QR screen + loyalty config edit; POS phone display and points badge.
5. Rollback: stop `angular_client`; public routes removed or deprecated — internal flows unaffected.

## Open Questions

None — scope, identity policy, points rule, payment handling, and QR content were resolved with the user before proposing.