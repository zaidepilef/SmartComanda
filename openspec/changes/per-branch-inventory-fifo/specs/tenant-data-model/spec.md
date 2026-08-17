## MODIFIED Requirements

### Requirement: Inventory collections schema
The system SHALL provide a migration that creates `ingredients`, `dishes`, `stocks`, and `inventory-movements` collections, scoped by `tenantId`. Each `stocks` document SHALL represent a purchase batch with `tenantId` (reference to a tenant), `branchId` (reference to a branch), `ingredientId` (reference to an ingredient), `quantity` (remaining quantity), `unitCost` (landed unit cost of the batch), and `createdAt`. Each `inventory-movements` document SHALL contain `tenantId`, `branchId`, `ingredientId`, `quantity` (signed change), `unitCost`, `batchId` (when applicable), `reason`, `orderId` (when applicable), `userId`, and `createdAt`.

#### Scenario: Applying the migration creates the inventory collections
- **WHEN** the migration runs on a database without the inventory collections
- **THEN** `ingredients`, `dishes`, `stocks`, and `inventory-movements` collections exist and accept tenant-scoped documents

#### Scenario: Stock documents hold batch costs
- **WHEN** a stock document is stored for a branch with a remaining quantity and a landed unit cost
- **THEN** the document is accepted and the quantity and cost are stored and retrievable

#### Scenario: Stock lookups are indexed
- **WHEN** the migration has run
- **THEN** the `stocks` collection has an index on `tenantId` and an index on the tenant/branch/ingredient combination used to resolve a branch's stock pool

#### Scenario: Movement history lookups are indexed
- **WHEN** the migration has run
- **THEN** the `inventory-movements` collection has an index on `tenantId`, an index on `ingredientId`, and an index on `branchId`