# tenant-data-model Specification (delta)

## MODIFIED Requirements

### Requirement: Orders collection schema
The system SHALL provide a migration that creates an `orders` collection in MongoDB where each order document contains `tenantId` (reference to a tenant), `foodtruckId` (reference to a branch), `status` (e.g., `pending`), `clientContact`, `items`, `total`, `createdAt`, and `updatedAt` fields. Each order item SHALL contain a `dishId` (reference to a dish), `name` (snapshot of the dish name), `price` (snapshot of the dish sale price), `quantity`, and `stockApplied` (boolean indicating whether the dish's ingredients were deducted from warehouse stock).

#### Scenario: Applying the migration creates the orders collection
- **WHEN** the migration runs on a database without an `orders` collection
- **THEN** an `orders` collection exists and accepts documents with `tenantId`, `foodtruckId`, `status`, `clientContact`, `items`, `total`, and timestamps.

#### Scenario: Order items store dish snapshots and stock decision
- **WHEN** an order document is stored with items containing `dishId`, `name`, `price`, `quantity`, and `stockApplied`
- **THEN** the document is accepted and the item fields are stored and retrievable.

#### Scenario: Order lookups by tenant and branch are indexed
- **WHEN** the migration has run
- **THEN** the `orders` collection has indexes on `tenantId` and `foodtruckId`.

## ADDED Requirements

### Requirement: Inventory collections schema
The system SHALL provide a migration that creates `ingredients`, `dishes`, `stocks`, and `inventory-movements` collections, scoped by `tenantId`, with indexes on the fields used for stock resolution and tenant isolation.

#### Scenario: Applying the migration creates the inventory collections
- **WHEN** the migration runs on a database without the inventory collections
- **THEN** `ingredients`, `dishes`, `stocks`, and `inventory-movements` collections exist and accept tenant-scoped documents.

#### Scenario: Stock lookups are indexed
- **WHEN** the migration has run
- **THEN** the `stocks` collection has an index on `tenantId` and an index on the ingredient/branch combination used to resolve the stock pool.

#### Scenario: Movement history lookups are indexed
- **WHEN** the migration has run
- **THEN** the `inventory-movements` collection has an index on `tenantId` and an index on `ingredientId`.

### Requirement: Versioned inventory migration applied on startup
The system SHALL apply the inventory collections schema through the existing versioned migration runner, so it runs automatically at backend startup, in version order, and is tracked in the `migrations` collection.

#### Scenario: Applying the inventory migration on startup
- **WHEN** the backend starts with the inventory migration pending
- **THEN** the migration runs in version order before the API begins serving requests.

#### Scenario: Not re-applying the inventory migration
- **WHEN** the inventory migration is already recorded in the `migrations` collection
- **THEN** the migration is not executed again.
