## Why

The current inventory model treats warehouse mode as configurable (`shared` or `per_branch`) and stores a single static `unitCost` on each ingredient. In reality every tenant operates with per-branch warehouses, purchase prices change constantly (different suppliers, brands, and freight surcharges per branch), and those cost differences can affect sale prices per branch. The model must reflect that reality: stock is always per branch, and cost is a property of each purchase, not of the ingredient.

## What Changes

- **BREAKING**: Remove the configurable warehouse mode (`shared`/`per_branch`). Stock is always tracked per branch — a tenant never exists without at least one branch, and each branch has exactly one warehouse (1:1). `stock` lookups always require a branch reference.
- **BREAKING**: Ingredient `unitCost` is no longer the source of truth. Each stock entry (purchase) records its own landed unit cost (purchase price plus freight/surcharges), per branch.
- Purchases create inventory batches (lots); consumption (sales, waste) exits consume the oldest batch first (FIFO).
- Dish cost is computed from FIFO consumption of ingredient batches, per branch, at the moment stock is deducted.
- **BREAKING**: Dishes support per-branch sale prices; branch-specific costs may translate to branch-specific prices and margins.
- Beverages are modeled as normal ingredients (no separate concept).

## Capabilities

### New Capabilities

None — all behavior changes land in existing capabilities.

### Modified Capabilities

- `inventory-management`: warehouse mode becomes mandatory per-branch (mode configuration and mode-change blocking are removed); stock entries record landed unit cost per branch; purchases form batches; consumption follows FIFO; movements carry batch and unit cost.
- `ingredient-catalog`: ingredient `unitCost` becomes a reference value (e.g., last landed cost) rather than the source of truth for costing.
- `dish-recipes`: dish cost derives from FIFO batch consumption at deduction time; dishes carry per-branch sale prices.
- `tenant-data-model`: inventory schema changes — `stocks` are per `(tenant, branch, ingredient)`, batch tracking replaces single-quantity stock records, and inventory movements gain batch and unit cost fields.

## Impact

- Backend: inventory services (stock resolution, adjustments, movement audit), recipe/dish cost calculation, sales deduction flow, migrations for the new inventory schema.
- Data: `stocks`, `inventory-movements` collections change shape; batch records added; dish price becomes branch-scoped.
- Frontend admin: stock views are branch-scoped, purchase entry captures landed cost, dish editor supports per-branch prices.
- Order checkout: sale deductions must resolve batches FIFO per branch.