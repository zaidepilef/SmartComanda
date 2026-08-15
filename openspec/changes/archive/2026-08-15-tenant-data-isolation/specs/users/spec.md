## MODIFIED Requirements

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

## ADDED Requirements

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
