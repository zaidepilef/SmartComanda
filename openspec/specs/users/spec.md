# users Specification

## Purpose

Provides a complete CRUD API for the user entity backed by MongoDB, with versioned schema migrations run at backend startup and password security by design.

## Requirements

### Requirement: User entity persisted in MongoDB
The system SHALL persist users in a `users` collection in MongoDB with the following fields: `firstName`, `lastName`, `email`, `passwordHash`, `status` (active/inactive/pending), `createdAt`, and `updatedAt`. The system SHALL also persist `role` (one of `sysadmin`, `owner`, `admin`, `cashier`) and, when assigned, `tenantId` (reference to an existing tenant), `name` (optional display name), and timestamps.

#### Scenario: Creating a user persists all fields
- **WHEN** a valid user is created through the API
- **THEN** the user is stored in the `users` collection with all required fields populated.

#### Scenario: Email is unique
- **WHEN** a user is created or updated with an email that already belongs to another user
- **THEN** the operation fails with a conflict error and no duplicate email is stored.

#### Scenario: Public registration creates a pending user
- **WHEN** a user is created through the public registration endpoint
- **THEN** the user is stored with `pending` status.

#### Scenario: Creating a user with role and tenant
- **WHEN** an authenticated `sysadmin` creates a user providing `role` and `tenantId`
- **THEN** the user is stored with those values and returned without the password hash.

#### Scenario: Rejecting an unknown role
- **WHEN** a user is created or updated with a `role` other than `sysadmin`, `owner`, `admin`, or `cashier`
- **THEN** the API responds with HTTP 400 and no user is created or modified.

#### Scenario: Rejecting a nonexistent tenant
- **WHEN** a user is created or updated with a `tenantId` that does not reference an existing tenant
- **THEN** the API responds with HTTP 400 and no user is created or modified.

### Requirement: CRUD API for users
The system SHALL expose REST endpoints under `/api/users` to create, read, update, delete, and list users. All `/api/users` endpoints SHALL require a valid Bearer token issued by the authentication system. Create, update, and delete operations SHALL be restricted to users with the `sysadmin` role, or to users with the `admin` role operating within their own tenant. User reads SHALL be tenant-scoped: a non-sysadmin user SHALL only see users whose `tenantId` matches its own; a `sysadmin` SHALL see all users.

#### Scenario: Creating a user
- **WHEN** an authenticated `sysadmin` POSTs a valid user payload to `/api/users`
- **THEN** the API creates the user and responds with HTTP 201 and the created user without the password hash.

#### Scenario: Creating a user without authorized role
- **WHEN** a user whose role is neither `sysadmin` nor `admin` POSTs to `/api/users`
- **THEN** the API responds with HTTP 403 and no user is created.

#### Scenario: Admin creating a user in its own tenant
- **WHEN** an authenticated `admin` POSTs a valid user payload whose `tenantId` matches the admin's own tenant to `/api/users`
- **THEN** the API creates the user and responds with HTTP 201 and the created user without the password hash.

#### Scenario: Admin creating a user in another tenant
- **WHEN** an authenticated `admin` POSTs a user payload whose `tenantId` differs from the admin's own tenant
- **THEN** the API responds with HTTP 403 and no user is created.

#### Scenario: Reading a user in the same tenant
- **WHEN** a non-sysadmin authenticated client GETs `/api/users/:id` with an existing user id whose `tenantId` matches the client's own tenant
- **THEN** the API responds with HTTP 200 and the user without the password hash.

#### Scenario: Reading a user outside the client's tenant
- **WHEN** a non-sysadmin authenticated client GETs `/api/users/:id` with an existing user id whose `tenantId` differs from the client's own tenant, or that belongs to a user without a tenant
- **THEN** the API responds with HTTP 403 and no user data is returned.

#### Scenario: Sysadmin reading any user
- **WHEN** an authenticated `sysadmin` GETs `/api/users/:id` with an existing user id
- **THEN** the API responds with HTTP 200 and the user without the password hash.

#### Scenario: Reading a nonexistent user
- **WHEN** an authenticated client GETs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Updating a user in the same tenant
- **WHEN** an authenticated `admin` PUTs a valid payload to `/api/users/:id` for an existing user of the admin's own tenant
- **THEN** the API updates the user, returns HTTP 200 with the updated user without the password hash, and refreshes `updatedAt`.

#### Scenario: Updating a user outside the actor's scope
- **WHEN** a user whose role is not `sysadmin` PUTs to `/api/users/:id` for a user outside the actor's own tenant
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin activating or deactivating a user of its tenant
- **WHEN** an authenticated `admin` PUTs a payload changing the `status` of an existing user of the admin's own tenant to `/api/users/:id`
- **THEN** the API updates the user status and responds with HTTP 200.

#### Scenario: Deleting a user
- **WHEN** an authenticated `sysadmin` DELETEs `/api/users/:id` with an existing user id
- **THEN** the API removes the user and responds with HTTP 204.

#### Scenario: Deleting a user without sysadmin role
- **WHEN** a user whose role is not `sysadmin` DELETEs `/api/users/:id`
- **THEN** the API responds with HTTP 403 and no user is removed.

#### Scenario: Deleting a nonexistent user
- **WHEN** an authenticated client DELETEs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Listing users by pending status
- **WHEN** an authenticated client GETs `/api/users?status=pending`
- **THEN** the API responds only with users of the client's tenant (or all users for `sysadmin`) whose status is `pending`.

### Requirement: User listing with pagination
The system SHALL support listing users with pagination via `page` and `limit` query parameters, returning the requested page plus total count. The listing SHALL be tenant-scoped: a non-sysadmin user SHALL only receive users whose `tenantId` matches its own.

#### Scenario: Listing users with pagination
- **WHEN** an authenticated client GETs `/api/users?page=1&limit=10`
- **THEN** the API responds with HTTP 200 containing up to `limit` users without password hashes, the current page, the total number of users, and the total number of pages.

#### Scenario: Filtering by status
- **WHEN** an authenticated client GETs `/api/users?status=active`
- **THEN** the API responds only with users whose status matches the filter.

#### Scenario: Tenant user only lists its own tenant users
- **WHEN** a non-sysadmin authenticated client GETs `/api/users`
- **THEN** the API responds only with users whose `tenantId` matches the client's own tenant, and never with users of other tenants or users without a tenant.

#### Scenario: Unauthenticated user CRUD request
- **WHEN** a client requests any `/api/users` endpoint without a valid Bearer token
- **THEN** the API responds with HTTP 401 and no user data is returned.

### Requirement: Anti-escalation constraints for admin user management
The system SHALL prevent tenant-scoped administrators from escalating privileges: an `admin` SHALL NOT assign or change the `sysadmin` role, SHALL NOT set a user's `tenantId` to a tenant other than the admin's own tenant, and SHALL NOT create, update, or delete users that belong to other tenants or that hold the `sysadmin` role.

#### Scenario: Admin creating a sysadmin user
- **WHEN** an authenticated `admin` POSTs a user payload with `role: sysadmin`
- **THEN** the API responds with HTTP 403 and no user is created.

#### Scenario: Admin changing a user's role to sysadmin
- **WHEN** an authenticated `admin` PUTs a payload setting `role: sysadmin` to `/api/users/:id` for a user of its tenant
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin moving a user to another tenant
- **WHEN** an authenticated `admin` PUTs a payload with a `tenantId` different from the admin's own tenant to `/api/users/:id`
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin editing or deleting a sysadmin user
- **WHEN** an authenticated `admin` PUTs or DELETEs `/api/users/:id` for a user with the `sysadmin` role
- **THEN** the API responds with HTTP 403 and no user is modified or removed.

### Requirement: Password security
The system SHALL hash passwords before storing them and SHALL NOT return the password hash in any API response.

#### Scenario: Password is hashed on creation
- **WHEN** a user is created with a plaintext password
- **THEN** the stored record contains a hashed password and never the plaintext.

#### Scenario: Password is never exposed
- **WHEN** any endpoint returns a user
- **THEN** the response body never contains the `passwordHash` field.

#### Scenario: Updating a password re-hashes it
- **WHEN** a user's password is updated through the API
- **THEN** the new password is hashed before being stored and the previous hash is replaced.

### Requirement: Input validation
The system SHALL validate user input and reject malformed payloads with HTTP 400 and a descriptive error.

#### Scenario: Rejecting invalid payloads
- **WHEN** a client submits a user payload with a missing required field or an invalid email
- **THEN** the API responds with HTTP 400 and a descriptive error and no user is created or modified.

### Requirement: Versioned schema migrations
The system SHALL run versioned MongoDB migrations at backend startup, applying pending migrations in order and tracking applied ones in a `migrations` collection.

#### Scenario: Applying pending migrations on startup
- **WHEN** the backend starts and the database contains migrations not yet applied
- **THEN** those migrations are applied in version order before the API begins serving requests.

#### Scenario: Not re-applying applied migrations
- **WHEN** the backend starts and all registered migrations are already recorded in the `migrations` collection
- **THEN** no migration is re-executed.

#### Scenario: Failing startup on migration error
- **WHEN** a migration fails during startup
- **THEN** the backend logs the error and exits without serving requests.

#### Scenario: Ensuring the email unique index
- **WHEN** migrations have run on an empty database
- **THEN** a unique index exists on the `users.email` field and an index exists on the `users.status` field.

#### Scenario: Backfilling initial roles
- **WHEN** the role backfill migration runs on a database with existing users and no `role` field
- **THEN** the user matching `SYSADMIN_EMAIL` gets `role: sysadmin` and the other existing active users get `role: owner`, and the migration is recorded in the `migrations` collection.

#### Scenario: Backfill respects SYSADMIN_EMAIL configuration
- **WHEN** the role backfill migration runs
- **THEN** the account promoted to `sysadmin` is the one whose email equals `SYSADMIN_EMAIL` (default `fel.di.rod@gmail.com`).