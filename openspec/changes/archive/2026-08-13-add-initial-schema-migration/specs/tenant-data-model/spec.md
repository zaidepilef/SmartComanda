## Purpose

Defines the initial MongoDB schema for SmartComanda's core operational entities — tenants, tenant-scoped users, branches (food trucks), and orders — created through the versioned migration runner at backend startup.

## ADDED Requirements

### Requirement: Tenants collection schema
The system SHALL provide a migration that creates a `tenants` collection in MongoDB where each tenant document contains `name`, `rut`, `razonSocial`, `active`, `createdAt`, and `updatedAt` fields.

#### Scenario: Applying the migration creates the tenants collection
- **WHEN** the migration runs on a database without a `tenants` collection
- **THEN** a `tenants` collection exists and accepts documents with `name`, `rut`, `razonSocial`, `active`, and timestamps.

### Requirement: Users collection tenant fields
The system SHALL extend the existing `users` collection so that user documents may optionally include `tenantId` (reference to a tenant), `name`, and `role` fields, without breaking existing user documents. Multiple users SHALL be able to belong to the same tenant (many-to-one: many user documents may reference the same `tenantId`).

#### Scenario: Existing users remain valid after migration
- **WHEN** the migration runs on a database that already contains user documents
- **THEN** those documents remain stored and readable without modification, and the new fields are absent or optional.

#### Scenario: New user fields are indexed
- **WHEN** the migration has run
- **THEN** the `users` collection has an index on the `tenantId` field.

#### Scenario: Multiple users share a tenant
- **WHEN** several user documents are stored with the same `tenantId` value
- **THEN** all of them are stored and retrievable; the `tenantId` field is not unique.

### Requirement: User roles
The system SHALL constrain the user `role` field to one of four values: `sysadmin`, `owner`, `admin`, and `cashier`. The `sysadmin` role is the super user: it SHALL NOT belong to a tenant (its `tenantId` is absent or null) and SHALL be able to operate across all tenants. The `owner`, `admin`, and `cashier` roles SHALL belong to a tenant.

#### Scenario: Valid role values
- **WHEN** a user document stores a `role` value of `sysadmin`, `owner`, `admin`, or `cashier`
- **THEN** the document is valid under the role model.

#### Scenario: Invalid role values are rejected
- **WHEN** a user document stores a `role` value other than the four defined roles
- **THEN** the document is invalid under the role model and is not accepted by the system.

#### Scenario: Global sysadmin without tenant
- **WHEN** a user document has `role` set to `sysadmin`
- **THEN** it has no `tenantId` (absent or null) and can operate across all tenants.

### Requirement: Branches collection schema
The system SHALL provide a migration that creates a `branches` collection in MongoDB where each branch document contains `tenantId` (reference to a tenant), `name`, `type` (e.g., `FoodTruck`), `active`, `createdAt`, and `updatedAt` fields.

#### Scenario: Applying the migration creates the branches collection
- **WHEN** the migration runs on a database without a `branches` collection
- **THEN** a `branches` collection exists and accepts documents with `tenantId`, `name`, `type`, `active`, and timestamps.

#### Scenario: Branch lookups by tenant are indexed
- **WHEN** the migration has run
- **THEN** the `branches` collection has an index on `tenantId` and an index on `active`.

### Requirement: Orders collection schema
The system SHALL provide a migration that creates an `orders` collection in MongoDB where each order document contains `tenantId` (reference to a tenant), `foodtruckId` (reference to a branch), `status` (e.g., `pending`), `clientContact`, `items`, `total`, `createdAt`, and `updatedAt` fields.

#### Scenario: Applying the migration creates the orders collection
- **WHEN** the migration runs on a database without an `orders` collection
- **THEN** an `orders` collection exists and accepts documents with `tenantId`, `foodtruckId`, `status`, `clientContact`, `items`, `total`, and timestamps.

#### Scenario: Order lookups by tenant and branch are indexed
- **WHEN** the migration has run
- **THEN** the `orders` collection has indexes on `tenantId` and `foodtruckId`.

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