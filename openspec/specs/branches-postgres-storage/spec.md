# branches-postgres-storage Specification

## Purpose

Establishes PostgreSQL as the persistence layer for the Branch domain (sucursales and foodtrucks), with versioned schema migrations, a one-time idempotent import from MongoDB, and an atomic per-branch order counter that existing Mongo-driven order flows continue to consume.

## Requirements

### Requirement: PostgreSQL connection for branches
The system SHALL persist branch data in the PostgreSQL `smartcomanda` database using the same connection pool used by the identity domain, independent of the MongoDB connection.

#### Scenario: Branch storage uses PostgreSQL
- **WHEN** branch data is written or read
- **THEN** the system uses the PostgreSQL `branches` table, not a MongoDB collection.

### Requirement: Branches table in PostgreSQL
The system SHALL define a `branches` table whose primary id preserves the source MongoDB object id as a 24-hex string, so references from other modules (users, orders, cash sessions) remain valid. Each branch SHALL store `tenantId` (referencing an existing tenant), `name`, `type`, `address`, `city`, `phone`, `active`, `paymentMethods`, and `nextOrderNumber`.

#### Scenario: Branch table exists after migration
- **WHEN** versioned SQL migrations have run on an empty database
- **THEN** the `branches` table exists with the documented columns.

#### Scenario: Preserving source ids
- **WHEN** branch data is imported from MongoDB
- **THEN** each branch keeps its original MongoDB object id as the primary id, and its `tenantId` matches a tenant row.

### Requirement: Versioned branch migrations run on startup
The system SHALL apply branch schema changes as versioned PostgreSQL migrations at backend startup, in version order, tracking applied ones, and SHALL stop startup if a migration fails.

#### Scenario: Applying pending branch migrations
- **WHEN** the backend starts and the branches migration is unapplied
- **THEN** the migration is applied before the API serves requests.

#### Scenario: Not re-running applied branch migrations
- **WHEN** the backend starts and the branches migration is already applied
- **THEN** the migration is not re-executed.

### Requirement: Atomic branch order counter
The system SHALL expose an atomic increment of a branch's `nextOrderNumber` so that concurrent requests for the same branch observe strictly increasing, non-repeating order numbers, preserving the behavior previously provided by MongoDB's atomic compare-and-increment.

#### Scenario: Incrementing the order counter
- **WHEN** a request asks for the next order number of a branch
- **THEN** the branch's counter is incremented and the new value is returned without duplicates under concurrent load.
