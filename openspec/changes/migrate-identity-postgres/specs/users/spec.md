## MODIFIED Requirements

### Requirement: User entity persisted in PostgreSQL
The system SHALL persist users in a `users` table in PostgreSQL with the following fields: `firstName`, `lastName`, `email`, `passwordHash`, `status` (active/inactive/pending), `createdAt`, and `updatedAt`. The system SHALL also persist `tenantId` (reference to an existing tenant), `name` (optional display name), and a set of roles (`sysadmin`, `owner`, `admin`, `cashier`) stored through the `user_roles` relationship.

#### Scenario: Creating a user persists all fields
- **WHEN** a valid user is created through the API
- **THEN** the user is stored in the `users` table with all required fields populated and its roles linked via `user_roles`.

#### Scenario: Email is unique
- **WHEN** a user is created or updated with an email that already belongs to another user
- **THEN** the operation fails with a conflict error and no duplicate email is stored.

#### Scenario: Public registration creates a pending user
- **WHEN** a user is created through the public registration endpoint
- **THEN** the user is stored with `pending` status.

#### Scenario: Creating a user with roles and tenant
- **WHEN** an authenticated `sysadmin` creates a user providing `roles` and `tenantId`
- **THEN** the user is stored with those values and returned without the password hash.

#### Scenario: Rejecting an unknown role
- **WHEN** a user is created or updated with a role other than `sysadmin`, `owner`, `admin`, or `cashier`
- **THEN** the API responds with HTTP 400 and no user is created or modified.

#### Scenario: Rejecting a nonexistent tenant
- **WHEN** a user is created or updated with a `tenantId` that does not reference an existing tenant
- **THEN** the API responds with HTTP 400 and no user is created or modified.

### Requirement: CRUD API for users
The system SHALL expose REST endpoints under `/api/users` to create, read, update, delete, and list users. All `/api/users` endpoints SHALL require a valid Bearer token issued by the authentication system. Create, update, and delete operations SHALL be restricted to users whose roles include `sysadmin`, or to users whose roles include `admin` operating within their own tenant. User reads SHALL be tenant-scoped: a non-sysadmin user SHALL only see users whose `tenantId` matches its own; a user with the `sysadmin` role SHALL see all users.

#### Scenario: Creating a user
- **WHEN** an authenticated `sysadmin` POSTs a valid user payload to `/api/users`
- **THEN** the API creates the user and responds with HTTP 201 and the created user without the password hash.

#### Scenario: Creating a user without authorized role
- **WHEN** a user whose roles are neither `sysadmin` nor `admin` POSTs to `/api/users`
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
- **WHEN** a user whose roles do not include `sysadmin` PUTs to `/api/users/:id` for a user outside the actor's own tenant
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin activating or deactivating a user of its tenant
- **WHEN** an authenticated `admin` PUTs a payload changing the `status` of an existing user of the admin's own tenant to `/api/users/:id`
- **THEN** the API updates the user status and responds with HTTP 200.

#### Scenario: Assigning multiple roles when updating a user
- **WHEN** an authorized actor updates a user providing a `roles` array with more than one value
- **THEN** the API replaces the user's role set with exactly the provided roles.

#### Scenario: Deleting a user
- **WHEN** an authenticated `sysadmin` DELETEs `/api/users/:id` with an existing user id
- **THEN** the API removes the user and responds with HTTP 204.

#### Scenario: Deleting a user without sysadmin role
- **WHEN** a user whose roles do not include `sysadmin` DELETEs `/api/users/:id`
- **THEN** the API responds with HTTP 403 and no user is removed.

#### Scenario: Deleting a nonexistent user
- **WHEN** an authenticated client DELETEs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Listing users by pending status
- **WHEN** an authenticated client GETs `/api/users?status=pending`
- **THEN** the API responds only with users of the client's tenant (or all users for `sysadmin`) whose status is `pending`.

### Requirement: Anti-escalation constraints for admin user management
The system SHALL prevent tenant-scoped administrators from escalating privileges: an `admin` SHALL NOT assign or change the `sysadmin` role, SHALL NOT set a user's `tenantId` to a tenant other than the admin's own tenant, and SHALL NOT create, update, or delete users that belong to other tenants or that hold the `sysadmin` role.

#### Scenario: Admin creating a sysadmin user
- **WHEN** an authenticated `admin` POSTs a user payload with `roles` including `sysadmin`
- **THEN** the API responds with HTTP 403 and no user is created.

#### Scenario: Admin changing a user's role to sysadmin
- **WHEN** an authenticated `admin` PUTs a payload setting `roles` to include `sysadmin` to `/api/users/:id` for a user of its tenant
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin moving a user to another tenant
- **WHEN** an authenticated `admin` PUTs a payload with a `tenantId` different from the admin's own tenant to `/api/users/:id`
- **THEN** the API responds with HTTP 403 and no user is modified.

#### Scenario: Admin editing or deleting a sysadmin user
- **WHEN** an authenticated `admin` PUTs or DELETEs `/api/users/:id` for a user with the `sysadmin` role
- **THEN** the API responds with HTTP 403 and no user is modified or removed.
