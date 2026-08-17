## Context

Current implementation (see proposal.md for motivation):

- `tenants.warehouseMode` (`shared` | `per_branch`) drives stock resolution in `inventoryService.resolveStockPool` (backend/src/services/inventoryService.js:81).
- `stocks` documents are single quantity records with a **unique** index `(tenantId, ingredientId, branchId)` (migration 005) — one doc per ingredient per pool, no cost, no history.
- `ingredients.unitCost` is the only cost source; `dishes.computedCost` is computed and persisted from it (backend/src/services/dishService.js).
- Order checkout deducts stock per ingredient via `orderService.tryDeductDishStock` (backend/src/services/orderService.js:76) and snapshots `stockApplied` on the order.
- Migrations are versioned 001-005; next available version is 006.

## Goals / Non-Goals

**Goals:**

- Stock always per branch (bodega per sucursal, 1:1); no mode concept anywhere in the codebase.
- Purchase entries record landed unit cost (incl. freight) and become batches.
- FIFO consumption for all exits (manual and sale deductions), with cost breakdown recorded per movement.
- Dish cost derived from FIFO batches per branch; dishes support per-branch sale prices.

**Non-Goals:**

- Cost history/price reports or margin analytics dashboards (reporting is a future capability; the data model supports it).
- Multi-warehouse per branch (deliberately 1:1).
- Supplier/catalog entity for purchases (reasons remain free text).

## Decisions

### 1. The `stocks` collection becomes the batch ledger

Each `stocks` document is one batch: `{ tenantId, branchId, ingredientId, quantity (remaining), unitCost (landed), createdAt }`. There is no separate aggregate "current stock" document — total stock per ingredient/branch is the sum of its batches.

- **Why**: consumption always touches batches, so maintaining a parallel aggregate doc means two writes to keep in sync per movement. Batches-as-stock keeps a single source of truth.
- **Alternatives considered**: (a) aggregate stock doc + separate `stock-batches` collection — rejected for dual-write consistency; (b) one doc per batch inside a `batches` array of a stock doc — rejected: unbounded arrays complicate FIFO queries and indexing.

Indexes: drop the unique `(tenantId, ingredientId, branchId)`; add non-unique `(tenantId, branchId, ingredientId)` plus `createdAt` (FIFO ordering). Batch identity is `_id`.

### 2. Warehouse mode is removed entirely

Delete `getWarehouseMode`/`setWarehouseMode` services, their routes/controllers, and the `resolveStockPool` mode branch: stock resolution always requires `branchId`. Migration 006 drops `tenants.warehouseMode`.

- **Why**: the business model is mandatory per-branch; keeping dead configurability adds branching and test surface with no users.
- **Alternatives considered**: deprecating the field silently — rejected, leaves dead code paths and index/validation ambiguity.

### 3. FIFO consumption algorithm

On any exit (manual or sale):

1. Query batches for `(tenantId, branchId, ingredientId)` ordered by `createdAt` asc.
2. Consume from the oldest; split across batches when the oldest is exhausted.
3. Record the breakdown in the movement: `batches: [{ batchId, quantity, unitCost }]`, plus a single `unitCost` when the movement spans one batch.
4. Update each touched batch's `quantity` (remaining); delete/zero out exhausted batches.

Round quantities to 4 decimals, consistent with `inventoryService.roundQuantity`.

### 4. Money precision

`unitCost` is stored as a plain JavaScript `Number` (IEEE 754 double), matching the rest of the codebase; FIFO weighted cost and dish cost use standard JS arithmetic, and dish sale prices are integer pesos as elsewhere in the API.

- **Why**: the existing codebase (prices, quantities, orders) already uses JS numbers and integer-peso prices; introducing `Decimal128` only for inventory would force conversions and driver-serialization quirks for a marginal precision gain at these scales.
- **Alternatives considered**: `Decimal128` (rejected — inconsistent with codebase, complicates serialization); integer cents (rejected — mixes badly with fractional ingredient quantities such as grams of tomato at $2000/kg).

### 5. Dish cost is derived per branch, on demand

`dishes.computedCost` is no longer authoritative. Dish cost per branch is computed by simulating FIFO consumption of each recipe line against that branch's batches. The stored `computedCost` field is removed from new dish writes (legacy field can be dropped in 006).

- **Why**: with per-branch batches, a single persisted cost is wrong by construction; simulating FIFO is a pure read over a handful of batches.
- **Alternatives considered**: persist per-branch costs on every movement — rejected, redundant writes and staleness risk.

### 6. Per-branch dish sale prices

Dish document gains `branchPrices: [{ branchId, price }]`; `salePrice` remains the default. Checkout resolves `branchPrices.find(branchId) ?? salePrice` and snapshots the resolved price into the order item (orders already snapshot `price`).

### 7. Deduction atomicity

Sale deductions update multiple batch docs plus a movement. MongoDB transactions (replica set) wrap the deduction; if the deployment is a standalone server, fall back to best-effort per-batch updates with a compensating "restore" movement on partial failure.

- **Why**: FIFO can split one deduction across batches; partial failure must not corrupt stock.
- **Alternatives considered**: single-document `$inc` per batch — cannot be atomic across batches; per-ingredient locking via findAndModify on a lock doc — rejected, complex and slow.

## Risks / Trade-offs

- [FIFO over many batches is O(n) per deduction] → Batches per ingredient/branch are few (purchases happen per delivery); add `createdAt` index. If volume grows, cap with periodic batch consolidation.
- [Migration of legacy `shared`-mode stock has no true cost/branch attribution] → Assign legacy stock to the tenant's first branch with `unitCost` = the ingredient's reference cost at migration time; document it as an approximation. Only affects tenants that used `shared` mode (default).
- [JS number precision on long FIFO chains] → Rounds quantities to 4 decimals and uses plain numbers like the rest of the API; revisit `Decimal128` only if cost drift is ever observed in practice.
- [Transactions need a replica set] → Deployment must run MongoDB as a replica set (single-node rs is fine); document this requirement in the compose config.

## Migration Plan

1. Ship migration `006`:
   - Drop `stocks` unique index `(tenantId, ingredientId, branchId)`.
   - Convert existing stock docs to batches: set `branchId` = tenant's first branch when `null`, set `unitCost` = ingredient's reference `unitCost`, keep `quantity` as remaining, add `createdAt` if missing.
   - Create non-unique indexes `(tenantId, branchId, ingredientId)` and `(createdAt)`.
   - Drop `tenants.warehouseMode`; drop `dishes.computedCost`.
2. Remove mode endpoints from routes/controllers (breaking API change; document in API docs).
3. Rollback: restore from backup; mode endpoints were deleted so no downgrade path is provided — acceptable while the platform is pre-production.