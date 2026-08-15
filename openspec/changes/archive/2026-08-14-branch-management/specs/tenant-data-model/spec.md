## MODIFIED Requirements

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
