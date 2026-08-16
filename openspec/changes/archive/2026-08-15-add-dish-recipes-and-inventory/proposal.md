## Why

Food trucks currently cannot define what goes into the dishes they sell. `orders.items` is a free-form array with no link to products, ingredients, or stock. The business needs a way to configure dishes (hotdog, hamburger, sandwich, french fries) from ingredients measured in different units (per-unit, grams/kilos, liters), track warehouse stock, and let the cashier decide at sale time whether stock is deducted or the dish is prepared on demand.

## What Changes

- New `ingredients` catalog: each ingredient has a name, a measurement unit, a measurement dimension (count, mass, volume), and a unit cost.
- New `dishes` (recipes) catalog: each dish has a name, a sale price, and a list of ingredient quantities. The dish cost is computed automatically from ingredient unit costs.
- New warehouse configuration per tenant: a global toggle choosing **shared warehouse** (one stock pool for the tenant) or **per-branch warehouse** (each food truck has its own stock).
- New `stocks` collection: one document per ingredient (and branch, when per-branch mode). Mode changes are **blocked** while stock records exist.
- Manual stock adjustments: owners/admins can add (purchase) or remove (waste, spoilage) stock, with every movement recorded for audit.
- New sales flow for cashiers: build an order from dishes, with a **per-item** toggle to deduct stock or not. If the cashier chooses to deduct but stock is insufficient, the system warns and suggests switching to "do not deduct" instead of blocking the sale.
- Order items now record the dish reference, a name/price snapshot, quantity, and the `stockApplied` decision.

## Capabilities

### New Capabilities
- `ingredient-catalog`: manage ingredients with unit, measurement dimension, and unit cost.
- `dish-recipes`: define dishes from ingredient quantities, with auto-computed cost and sale price.
- `inventory-management`: shared or per-branch warehouse, stock levels, manual adjustments, movement audit, and mode-change blocking.
- `order-checkout`: cashier order creation with dish items, per-item stock deduction decision, and insufficient-stock handling.

### Modified Capabilities
- `tenant-data-model`: adds new collections (`ingredients`, `dishes`, `stocks`, `inventory-movements`) created by a new versioned migration, and redefines the `orders.items` structure to reference dishes with a snapshot and the `stockApplied` flag.

## Impact

- **Backend**: new migrations, models, repositories, services, controllers, routes, and validation schemas for ingredients, dishes, stock, movements, and checkout. The existing orders flow gains dish-based items.
- **Frontend-admin**: new admin views for ingredient catalog, dish recipes, warehouse configuration, and stock adjustments; a checkout view for cashiers with the per-item deduction toggle.
- **Roles**: `owner`/`admin` manage catalog, recipes, and stock; `cashier` only creates sales.
- **Database**: MongoDB collections `ingredients`, `dishes`, `stocks`, `inventory-movements`; updated `orders` documents.
