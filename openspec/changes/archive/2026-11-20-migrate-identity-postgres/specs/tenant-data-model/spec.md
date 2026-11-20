## MODIFIED Requirements

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
