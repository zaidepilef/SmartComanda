## MODIFIED Requirements

### Requirement: Orders collection schema
The system SHALL provide a migration that creates an `orders` collection in MongoDB where each order document contains `tenantId` (reference to a tenant), `foodtruckId` (reference to a branch), `number` (sequential per branch), `status` (e.g., `pending`), `orderType` (one of `takeaway`, `dinein`, `delivery`, `qr`), `paymentStatus` (`pending` or `paid`), `paymentMethod` (one of `cash`, `debit`, `credit`, `transfer`, present when paid), `clientContact`, `items`, `total`, `createdAt`, and `updatedAt` fields. Each order item SHALL contain a `dishId` (reference to a dish), `name` (snapshot of the dish name), `price` (snapshot of the dish sale price), `quantity`, and `stockApplied` (boolean indicating whether the dish's ingredients were deducted from warehouse stock).

#### Scenario: Applying the migration creates the orders collection
- **WHEN** the migration runs on a database without an `orders` collection
- **THEN** an `orders` collection exists and accepts documents with `tenantId`, `foodtruckId`, `status`, `clientContact`, `items`, `total`, and timestamps.

#### Scenario: Order items store dish snapshots and stock decision
- **WHEN** an order document is stored with items containing `dishId`, `name`, `price`, `quantity`, and `stockApplied`
- **THEN** the document is accepted and the item fields are stored and retrievable.

#### Scenario: Charged orders store payment fields
- **WHEN** a paid order document is stored with `number`, `orderType`, `paymentStatus` `paid`, and `paymentMethod`
- **THEN** the document is accepted and the payment fields are stored and retrievable.

#### Scenario: Order lookups by tenant and branch are indexed
- **WHEN** the migration has run
- **THEN** the `orders` collection has indexes on `tenantId` and `foodtruckId`.

#### Scenario: Order numbers are unique per branch
- **WHEN** the migration has run
- **THEN** the `orders` collection enforces uniqueness of the `number` field within each `tenantId`/`foodtruckId` pair.

## ADDED Requirements

### Requirement: Cash sessions collection schema
The system SHALL provide a migration that creates a `cash-sessions` collection in MongoDB where each session document contains `tenantId` (reference to a tenant), `branchId` (reference to a branch), `openedBy` (reference to a user), `openedAt`, `openingAmount`, `status` (`open` or `closed`), `totals` (an object with `cash`, `debit`, `credit`, and `transfer` counters), `orderCount`, and `closedAt` and `closedBy` (reserved, null while open).

#### Scenario: Applying the migration creates the cash-sessions collection
- **WHEN** the migration runs on a database without a `cash-sessions` collection
- **THEN** a `cash-sessions` collection exists and accepts tenant-scoped session documents.

#### Scenario: Session documents store opening and totals
- **WHEN** a session document is stored with `openingAmount`, `status` `open`, and `totals`
- **THEN** the document is accepted and the fields are stored and retrievable.

#### Scenario: Open-session lookups are indexed
- **WHEN** the migration has run
- **THEN** the `cash-sessions` collection has an index on `tenantId` and an index on the `branchId`/`status` combination used to resolve a branch's open session.