# tenant-data-model Specification

## Purpose

Defines the initial MongoDB schema for SmartComanda's core operational entities — tenants, tenant-scoped users, branches (food trucks), and orders — created through the versioned migration runner at backend startup.

## Requirements

### Requirement: Tenants persisted in PostgreSQL
The system SHALL store tenants in a `tenant` table in PostgreSQL where each tenant row contains `name`, `rut`, `razonSocial`, `active`, `createdAt`, and `updatedAt` fields, plus a primary id that preserves the tenant's source object id as a UUID.

#### Scenario: Applying the migration creates the tenant table
- **WHEN** the SQL migration runs on a database without a `tenant` table
- **THEN** a `tenant` table exists and accepts rows with `name`, `rut`, `razonSocial`, `active`, and timestamps.

### Requirement: Users tenant fields
The system SHALL extend the `users` table in PostgreSQL so that user rows may optionally include `tenantId` (reference to a tenant), `name`, and a set of roles, without breaking existing user rows. Multiple users SHALL be able to belong to the same tenant (many-to-one: many user rows may reference the same `tenantId`).

#### Scenario: Existing users remain valid after migration
- **WHEN** the migration runs on a database that already contains user rows
- **THEN** those rows remain stored and readable without modification, and the new fields are absent or optional.

#### Scenario: Multiple users share a tenant
- **WHEN** several user rows are stored with the same `tenantId` value
- **THEN** all of them are stored and retrievable; the `tenantId` field is not unique.

### Requirement: User roles
The system SHALL store roles (`sysadmin`, `owner`, `admin`, `cashier`) through a `roles` table and a `user_roles` join table, supporting many-to-many assignments where a user may hold multiple roles. A user whose roles include `sysadmin` is the super user: it SHALL NOT belong to a tenant (its `tenantId` is absent or null) and SHALL be able to operate across all tenants. The `owner`, `admin`, and `cashier` roles SHALL belong to a tenant.

#### Scenario: Valid role values
- **WHEN** a user is assigned a role of `sysadmin`, `owner`, `admin`, or `cashier`
- **THEN** the assignment is valid under the role model.

#### Scenario: Invalid role values are rejected
- **WHEN** a user is assigned a role other than the four defined roles
- **THEN** the assignment is invalid under the role model and is not accepted by the system.

#### Scenario: Global sysadmin without tenant
- **WHEN** a user whose roles include `sysadmin` exists
- **THEN** it has no `tenantId` (absent or null) and can operate across all tenants.

### Requirement: Branches collection schema
The system SHALL provide a migration that creates a `branches` collection in MongoDB where each branch document contains `tenantId` (reference to a tenant), `name`, `type` (e.g., `FoodTruck`), `active`, `createdAt`, and `updatedAt` fields. Branch documents SHALL also accept the optional `address`, `city`, and `phone` fields.

#### Scenario: Applying the migration creates the branches collection
- **WHEN** the migration runs on a database without a `branches` collection
- **THEN** a `branches` collection exists and accepts documents with `tenantId`, `name`, `type`, `active`, and timestamps.

#### Scenario: Branch documents accept contact fields
- **WHEN** a branch document is stored with `address`, `city`, and `phone` values
- **THEN** the document is accepted and the fields are stored and retrievable.

#### Scenario: Branch lookups by tenant are indexed
- **WHEN** the migration has run
- **THEN** the `branches` collection has an index on `tenantId` and an index on `active`.

### Requirement: Orders collection schema
The system SHALL provide a migration that creates an `orders` collection in MongoDB where each order document contains `tenantId` (reference to a tenant), `foodtruckId` (reference to a branch), `number` (sequential per branch), `status` (e.g., `pending`), `orderType` (one of `takeaway`, `dinein`, `delivery`, `qr`), `paymentStatus` (`pending` or `paid`), `paymentMethod` (one of `cash`, `debit`, `credit`, `transfer`, present when paid), `clientContact`, `items`, `total`, `createdAt`, and `updatedAt` fields. Each order item SHALL contain a `dishId` (reference to a dish), `name` (snapshot of the dish name), `price` (snapshot of the dish sale price), `quantity`, and `stockApplied` (boolean indicating whether the dish's ingredients were deducted from warehouse stock). Onward from the migration, the system SHALL store on each order `clientPhone` (the customer's WhatsApp number, a string, present for public QR orders) and `pointsAwarded` (boolean flag, present and true once loyalty points were granted for the order). The existing `clientContact` free-form string SHALL remain unchanged.

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

#### Scenario: Public orders store the phone
- **WHEN** a public QR order is stored with `clientPhone`
- **THEN** the document is accepted with `clientContact` still optional and `clientPhone` retrievable

#### Scenario: Awarded orders carry the flag
- **WHEN** an order's points have been granted
- **THEN** the document stores `pointsAwarded` as true

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

### Requirement: Customers collection schema
The system SHALL provide a migration that creates a `customers` collection in MongoDB where each document contains `tenantId` (reference to a tenant), `phone` (WhatsApp number), optional `firstName`, `pointsBalance` (integer, default 0), and `createdAt`/`updatedAt`. `(tenantId, phone)` SHALL be unique.

#### Scenario: Applying the migration creates the customers collection
- **WHEN** the migration runs on a database without a `customers` collection
- **THEN** a `customers` collection exists, indexed on `tenantId` and enforcing uniqueness of `phone` within each tenant

#### Scenario: Duplicate phones within a tenant are rejected
- **WHEN** a customer is stored with a `(tenantId, phone)` pair that already exists
- **THEN** the insert fails on the unique index

### Requirement: Loyalty transactions collection schema
The system SHALL provide a migration that creates a `loyalty-transactions` collection in MongoDB where each document is an immutable ledger entry containing `tenantId`, `branchId`, `customerId`, `type` (`earn`), `points` (integer), `sourceOrderId` (reference to the order that produced it), and `createdAt`. The collection SHALL be indexed on `customerId` and `sourceOrderId`.

#### Scenario: Applying the migration creates the loyalty-transactions collection
- **WHEN** the migration runs on a database without a `loyalty-transactions` collection
- **THEN** a `loyalty-transactions` collection exists with the documented fields and indexes

#### Scenario: One transaction per award
- **WHEN** an order earns points
- **THEN** exactly one ledger entry is stored for the order, referencing it via `sourceOrderId`

### Requirement: Tenant loyalty configuration
The `tenants` collection SHALL accept an optional `loyalty` document with `pointsPerAmount` (positive integer, CLP per point) and `currency` (default `CLP`); its absence or a zero `pointsPerAmount` disables awarding.

#### Scenario: Storing the loyalty rule
- **WHEN** an `admin` updates the tenant with `loyalty: {pointsPerAmount: 1000, currency: "CLP"}`
- **THEN** the tenant document stores the rule and existing tenants without `loyalty` remain valid

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

### Requirement: Versioned migration applied on startup
The system SHALL apply the tenant data model schema through the existing versioned migration runner, so it runs automatically at backend startup, in version order, and is tracked in the `migrations` collection.

#### Scenario: Applying the migration on startup
- **WHEN** the backend starts with pending migrations
- **THEN** the tenant data model migration runs in version order before the API begins serving requests.

#### Scenario: Not re-applying the migration
- **WHEN** the migration is already recorded in the `migrations` collection
- **THEN** the migration is not executed again.

#### Scenario: Migration failure stops startup
- **WHEN** the migration fails during startup
- **THEN** the backend logs the error and exits without serving requests.

### Requirement: Versioned inventory migration applied on startup
The system SHALL apply the inventory collections schema through the existing versioned migration runner, so it runs automatically at backend startup, in version order, and is tracked in the `migrations` collection.

#### Scenario: Applying the inventory migration on startup
- **WHEN** the backend starts with the inventory migration pending
- **THEN** the migration runs in version order before the API begins serving requests.

#### Scenario: Not re-applying the inventory migration
- **WHEN** the inventory migration is already recorded in the `migrations` collection
- **THEN** the migration is not executed again.