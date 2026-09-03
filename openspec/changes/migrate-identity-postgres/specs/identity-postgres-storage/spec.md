## Purpose

Establishes PostgreSQL as the persistence layer for SmartComanda's identity domain (tenants, users, roles, and user-role assignments) in the `smartcomanda_db` database, including versioned schema migrations and a one-time import of existing identity data from MongoDB.

## ADDED Requirements

### Requirement: PostgreSQL connection for identity
The system SHALL connect to the PostgreSQL `smartcomanda_db` database using a connection string supplied via configuration, independent of the MongoDB connection. The connection SHALL be initialized before the API serves requests.

#### Scenario: Connecting to PostgreSQL on startup
- **WHEN** the backend starts with a valid database connection string
- **THEN** the API establishes a PostgreSQL connection pool for identity data before serving requests.

#### Scenario: Failing to connect prevents startup
- **WHEN** the backend starts with an invalid or missing database connection string
- **THEN** the backend logs an error and exits without serving requests.

### Requirement: Identity tables in PostgreSQL
The system SHALL define the identity schema in `smartcomanda_db` with the following tables: `tenant`, `users`, `roles`, and `user_roles`. Each `tenant` and `users` row SHALL carry a stable identity id that preserves the source MongoDB object id as a UUID, so references from other modules remain valid.

#### Scenario: Identity tables exist after migration
- **WHEN** versioned SQL migrations have run on an empty database
- **THEN** the `tenant`, `users`, `roles`, and `user_roles` tables exist with the documented columns.

#### Scenario: Preserving source ids as UUIDs
- **WHEN** identity data is imported from MongoDB
- **THEN** each tenant and user keeps its original MongoDB object id stored as a UUID in the primary id column.

### Requirement: Versioned SQL migrations run on startup
The system SHALL apply versioned PostgreSQL migrations at backend startup, in version order, tracking applied ones, and SHALL stop startup if a migration fails.

#### Scenario: Applying pending SQL migrations
- **WHEN** the backend starts and `smartcomanda_db` contains unapplied migrations
- **THEN** those migrations are applied in version order before the API serves requests.

#### Scenario: Not re-running applied SQL migrations
- **WHEN** the backend starts and all registered SQL migrations are already applied
- **THEN** no migration is re-executed.

#### Scenario: Failing startup on SQL migration error
- **WHEN** a SQL migration fails during startup
- **THEN** the backend logs the error and exits without serving requests.

### Requirement: One-time import of identity data from MongoDB
The system SHALL provide a one-time data import that copies existing `tenant`, `users`, and role assignments from MongoDB into the PostgreSQL identity tables, preserving each source object id as a UUID, and SHALL be idempotent so re-running it does not duplicate data.

#### Scenario: Importing existing identity data
- **WHEN** the import runs against a MongoDB instance containing tenants and users
- **THEN** matching rows are created in the PostgreSQL identity tables with unchanged ids and hashed passwords intact.

#### Scenario: Re-running the import is safe
- **WHEN** the import runs a second time over already-imported data
- **THEN** no duplicate identity rows are created.

### Requirement: Role assignments in PostgreSQL
The system SHALL persist role names in a `roles` table and assign zero or more roles to each user through the `user_roles` table, supporting a many-to-many relationship where a user can hold multiple roles and a role can apply to many users.

#### Scenario: Assigning multiple roles to a user
- **WHEN** a user is assigned more than one role
- **THEN** the system stores each assignment in `user_roles` and can retrieve all of the user's roles.

#### Scenario: User with no roles
- **WHEN** a user has no role assignments
- **THEN** the user exists in `users` and has an empty set of roles.
