# Design: add-dish-recipes-and-inventory

## Context

See proposal.md — Why. The backend is a layered Node.js API over MongoDB (single-node `mongo:8` container, no replica set), with a versioned migration runner (`backend/src/migrations`). Existing collections: `tenants`, `users`, `branches`, `orders` (`items` is free-form). The frontend is Angular (standalone components, view-based admin shell). This change adds the full ingredient → dish → inventory → checkout chain.

## Goals / Non-Goals

**Goals**

- A canonical data model for ingredients, dishes, stock, and movements that is tenant-scoped and branch-aware.
- A single stock collection that supports both warehouse modes with one resolution rule.
- An order flow that records dish snapshots and the per-item `stockApplied` decision.

**Non-Goals**

- Unit conversion between units of the same dimension (kg ↔ g, L ↔ mL). Each ingredient defines one canonical unit; recipes must use it.
- Low-stock alerts, reorder points, suppliers, purchase orders, and product expiration tracking.
- Modifiers/variants per dish (e.g., "extra tomato") — each variant would be its own dish.

## Decisions

### D1: One `stocks` collection with nullable `branchId`
A stock document is identified by `(tenantId, ingredientId, branchId?)`. In `shared` mode `branchId` is `null`; in `per_branch` mode it is always set. A single resolution function (`resolveStockPool(tenantId, branchId)`) picks the bucket: if the tenant is in `shared` mode, ignore the branch and use `branchId: null`.

- **Why**: one collection, one repository, one validation path. The two modes differ only in one field value.
- **Alternative considered**: separate collections per mode — rejected: duplicates all stock logic for no isolation gain.
- **Alternative considered**: per-ingredient granularity (`branchId` optional per ingredient) — rejected by product decision: mode is a global tenant toggle.

### D2: Warehouse mode stored on the tenant document
`tenants.warehouseMode` = `shared | per_branch`. Mode change is a single update guarded by a pre-check: if any `stocks` document exists for the tenant, reject.

- **Why**: the tenant is the natural scope; the guard is a cheap `findOne` on an indexed field.
- **Race note**: the guard is check-then-act; a concurrent stock creation between check and update is a benign edge case (stock document would be written under the new mode). Acceptable for v1.

### D3: Canonical unit per ingredient, no conversion
An ingredient stores `unit` (e.g., `gramos`) and `dimension` (`count | mass | volume`). Recipe lines and stock quantities always use the ingredient's canonical unit. Validation rejects a line whose unit's dimension does not match the ingredient's dimension.

- **Why**: users pick one unit when creating the ingredient (tomate → gramos). Conversion math (kg↔g) adds rounding and validation complexity for zero business need at v1.

### D4: Dish cost denormalized and recomputed
`dishes.computedCost` is stored on the dish document, computed at save time as Σ (line quantity × ingredient unit cost). When an ingredient's unit cost changes, a batch update recomputes `computedCost` for every dish that references it.

- **Why**: read-heavy checkout path reads one document per dish with no joins; recompute-on-change is a single `updateMany`.
- **Alternative considered**: compute cost at read time — rejected: mixes per-request computation into every list/checkout read.

### D5: Checkout deducts stock before creating the order, without transactions
The `orders` collection (mongo:8 single node, no replica set) cannot use multi-document transactions. The checkout flow is:

1. Validate items, resolve dishes, compute totals.
2. Per item with `stockApplied=true`: check each ingredient's stock; for any shortfall, mark the item `stockApplied=false` and add a warning to the response.
3. Deduct available ingredients with `findOneAndUpdate` (atomically per document), inserting an `inventory-movements` record per deduction.
4. Create the order with snapshots and final `stockApplied` flags.

- **Why**: each stock document update is atomic; the order is the last write, so a crash mid-flow leaves stock deducted without an order (movements make it auditable and manually correctable).
- **Trade-off**: crash consistency is eventual rather than transactional. Mitigated by the movement audit trail.
- **Alternative considered**: enabling a replica set for transactions — rejected: changes the docker deployment contract for a low-frequency edge.

### D6: Order items store snapshots, not live references
Each item stores `dishId`, `name` (snapshot), `price` (snapshot), `quantity`, `stockApplied`. Dish recipe is never snapshotted into the order — stock deduction happens at sale time, so the recipe used is the current one.

- **Why**: sale price must survive future price changes; recipe history at deduction time is already captured by the movement records.

### D7: One service layer each, following existing layering
New modules mirror the existing structure (`controllers` → `services` → `repositories` → `models`), plus validation schemas in `backend/src/validation`. Routes are protected by the existing auth/tenant middleware pattern.

## Risks / Trade-offs

- **Partially deducted stock on crash** → order creation happens last; `inventory-movements` records each deduction for manual reconciliation.
- **Mode-change race with concurrent stock creation** → benign for v1; the guard is a pre-check on an indexed field.
- **Dish cost recompute on every ingredient cost edit** → bounded by the number of dishes referencing the ingredient; acceptable at food-truck scale.
- **Stock-level precision with fractional units** (oil liters, tomato kg) → use numeric fields with a fixed scale; the movement trail preserves exact adjusted values.

## Migration Plan

1. New versioned migration `005_create_inventory_collections.js` creating `ingredients`, `dishes`, `stocks`, `inventory-movements` with tenant/branch indexes (runs automatically at startup via the existing runner).
2. Existing `orders` collection needs no structural migration — item shape is enforced by the service layer.
3. Rollback: delete the new collections and re-point the frontend to the previous build; order history is unaffected.

## Open Questions

None — the decisions above resolve the open threads from exploration (warehouse mode, mode-change blocking, per-item deduction, insufficient-stock behavior, roles).
