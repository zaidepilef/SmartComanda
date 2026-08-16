# Tasks: add-dish-recipes-and-inventory

## 1. Database migration

- [x] 1.1 Create `backend/src/migrations/005_create_inventory_collections.js` with `ingredients`, `dishes`, `stocks`, `inventory-movements` collections and indexes (`stocks` on `tenantId` and on `(tenantId, ingredientId, branchId)`; `inventory-movements` on `tenantId` and `ingredientId`; `dishes` and `ingredients` on `tenantId`)
- [x] 1.2 Extend `tenants` documents with `warehouseMode` field (default `shared`) via the migration

## 2. Ingredient catalog (backend)

- [x] 2.1 Create `models/ingredient.js` and validation schema (name unique per tenant, unit, dimension in `count|mass|volume`, non-negative cost)
- [x] 2.2 Create `repositories/ingredientRepository.js` with tenant-scoped CRUD
- [x] 2.3 Create `services/ingredientService.js` enforcing role access (`owner`/`admin` only) and the unit-change guard when the ingredient is referenced by dishes
- [x] 2.4 Create `controllers/ingredientController.js` and `routes/ingredients.js`, wire into the app with auth + tenant middleware

## 3. Dish recipes (backend)

- [x] 3.1 Create `models/dish.js` and validation schema (name, sale price, recipe lines referencing existing ingredients with compatible units and positive quantities)
- [x] 3.2 Create `repositories/dishRepository.js` with tenant-scoped CRUD
- [x] 3.3 Create `services/dishService.js` computing `computedCost` from ingredient unit costs and enforcing `owner`/`admin` access
- [x] 3.4 Create `controllers/dishController.js` and `routes/dishes.js`, wire into the app
- [x] 3.5 Add recompute of `dishes.computedCost` when an ingredient's unit cost changes (batch update in ingredientService)

## 4. Inventory management (backend)

- [x] 4.1 Create `services/inventoryService.js` with `resolveStockPool(tenantId, branchId)` honoring `warehouseMode`
- [x] 4.2 Create `repositories/stockRepository.js` (upsert/read quantities per ingredient/branch) and `repositories/movementRepository.js`
- [x] 4.3 Implement manual adjustment endpoint (entry/exit with reason) recording `inventory-movements`
- [x] 4.4 Implement warehouse-mode change endpoint with the block-if-stock-exists guard (`owner` only)
- [x] 4.5 Add routes and controller for stock views and movement history

## 5. Order checkout (backend)

- [x] 5.1 Extend `models/order.js` and validation for items with `dishId`, `name`, `price`, `quantity`, `stockApplied`
- [x] 5.2 Create `services/orderService.js` implementing the checkout flow per design D5 (validate → resolve stock → per-item deduction with warnings → movements → create order with snapshots)
- [x] 5.3 Create `controllers/orderController.js` and `routes/orders.js`, wire into the app

## 6. Frontend — configuration views

- [x] 6.1 Create ingredients view (list/create/edit with unit, dimension, cost) for `owner`/`admin`
- [x] 6.2 Create dishes view (list/create/edit recipes: dish name, sale price, ingredient lines with quantity/unit, shown computed cost)
- [x] 6.3 Create warehouse configuration view (shared/per-branch toggle with the block-if-stock error surfaced)
- [x] 6.4 Create stock adjustment view (entries/exits with reason) and movement history view
- [x] 6.5 Add services (`ingredients.service.ts`, `dishes.service.ts`, `inventory.service.ts`) and route/guard wiring for the new views

## 7. Frontend — checkout

- [x] 7.1 Create cashier checkout view: order builder with dish items and per-item "deduct stock" toggle
- [x] 7.2 Surface insufficient-stock warnings suggesting "do not deduct" and apply the server-returned `stockApplied` results
- [x] 7.3 Add orders service and route wiring

## 8. Validation

- [x] 8.1 Verify all specs scenarios are testable via manual or automated checks (ingredients, dishes, stock, checkout, roles)
- [x] 8.2 Run backend lint/tests and frontend build; confirm no regressions in existing views
