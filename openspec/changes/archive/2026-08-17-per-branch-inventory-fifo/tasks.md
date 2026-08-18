## 1. Migration

- [x] 1.1 Create migration 006: drop unique index `(tenantId, ingredientId, branchId)` from `stocks`
- [x] 1.2 Migration 006: convert existing stock docs to batches (assign `branchId` = tenant's first branch when null, `unitCost` = ingredient reference cost, ensure `createdAt`)
- [x] 1.3 Migration 006: create non-unique indexes `(tenantId, branchId, ingredientId)` and `(createdAt)` on `stocks`
- [x] 1.4 Migration 006: drop `tenants.warehouseMode` and `dishes.computedCost` fields

## 2. Remove warehouse mode

- [x] 2.1 Delete `getWarehouseMode`/`setWarehouseMode` from inventoryService and their repository helpers
- [x] 2.2 Remove mode routes/controllers and their API documentation entries
- [x] 2.3 Remove the mode branch in `resolveStockPool`: stock resolution always requires `branchId`
- [x] 2.4 Update inventory validation schemas (branchId always required, unitCost for entries, reason required)

## 3. Batch purchases

- [x] 3.1 Update stockRepository: entry creates a batch document with `quantity`, `unitCost`, `createdAt`
- [x] 3.2 Update adjustStock service: entries require landed `unitCost`; exits reject unitCost
- [x] 3.3 Update movementRepository and movement schema: movements carry `unitCost`, `batchId`, and `batches` breakdown

## 4. FIFO consumption

- [x] 4.1 Implement FIFO resolver service: given (tenant, branch, ingredient, qty) return oldest-first batch split with remaining updates
- [x] 4.2 Wire manual exits through the FIFO resolver and record the batch breakdown in the movement
- [x] 4.3 Handle partial-failure compensation when a deduction spans multiple batches (per design decision 7)

## 5. Derived dish cost

- [x] 5.1 Implement per-branch dish cost calculation simulating FIFO consumption per recipe line
- [x] 5.2 Update dishService to stop persisting `computedCost` and expose per-branch cost on demand
- [x] 5.3 Update dish model/validation for `branchPrices` array

## 6. Per-branch dish prices

- [x] 6.1 Update dish create/update services to accept and store `branchPrices` (default `salePrice` fallback)
- [x] 6.2 Update orderService checkout to resolve the branch price and snapshot it in the order item

## 7. Order deduction

- [x] 7.1 Update `tryDeductDishStock` to consume ingredient batches FIFO per branch inside a transaction (or compensating fallback)
- [x] 7.2 Verify order items still snapshot `stockApplied` and resolved prices

## 8. Frontend admin

- [x] 8.1 Stock views: always branch-scoped; purchase form captures landed unit cost
- [x] 8.2 Dish editor: per-branch sale prices; display per-branch dish cost
- [x] 8.3 Remove warehouse mode configuration UI

## 9. Validation

- [x] 9.1 Add backend tests: batch creation with cost, FIFO single/cross-batch consumption, per-branch costs and prices, mode removal
- [x] 9.2 Run backend test suite and fix regressions
- [x] 9.3 Run frontend build/lint and fix regressions
- [x] 9.4 Run `openspec validate` and archive the change when green