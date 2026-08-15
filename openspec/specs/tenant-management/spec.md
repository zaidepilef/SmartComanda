# tenant-management Specification

## Purpose

Provides a minimal tenants read capability for the admin UI — the API lists tenants so the sysadmin can assign users to a tenant when creating or editing users, backed by the `tenants` collection created by the data model migration.

## Requirements

### Requirement: List tenants
The system SHALL expose `GET /api/tenants` returning the list of tenants, requiring a valid Bearer token. Each tenant SHALL include `_id`, `name`, `rut`, `razonSocial`, `active`, `userCount` (the number of users whose `tenantId` references the tenant), and `branchCount` (the number of branches whose `tenantId` references the tenant). The list SHALL be tenant-scoped: a non-sysadmin user SHALL only receive the tenant matching its own `tenantId` (at most one), while a `sysadmin` SHALL receive all tenants.

#### Scenario: Listing tenants as sysadmin
- **WHEN** an authenticated `sysadmin` GETs `/api/tenants`
- **THEN** the API responds with HTTP 200 and the list of active and inactive tenants.

#### Scenario: Listing tenants as a tenant user
- **WHEN** an authenticated non-sysadmin user GETs `/api/tenants`
- **THEN** the API responds with HTTP 200 and a list containing only the tenant matching the user's own `tenantId` (an empty list when the user has no tenant).

#### Scenario: Listing tenants without authentication
- **WHEN** a client GETs `/api/tenants` without a valid Bearer token
- **THEN** the API responds with HTTP 401 and no tenant data is returned.

#### Scenario: Listing only active tenants for assignment
- **WHEN** the admin UI requests tenants to populate a user-assignment selector
- **THEN** the API supports filtering the list to only active tenants (e.g., `GET /api/tenants?active=true`).

#### Scenario: Counting users per tenant
- **WHEN** a client GETs `/api/tenants`
- **THEN** each tenant includes a `userCount` field with the number of users referencing it, without returning user data.

#### Scenario: Counting branches per tenant
- **WHEN** a client GETs `/api/tenants`
- **THEN** each tenant includes a `branchCount` field with the number of branches referencing it, without returning branch data.

### Requirement: Create tenant
The system SHALL expose `POST /api/tenants`, restricted to users with the `sysadmin` role, to create a tenant with `name` (required), `rut`, `razonSocial`, and `active` fields. The `rut` SHALL follow a lax Chilean format (`\d{1,2}\.\d{3}\.\d{3}-[\dkK]`); no digit-verifier validation is required.

#### Scenario: Creating a tenant as sysadmin
- **WHEN** an authenticated `sysadmin` POSTs a valid tenant payload to `/api/tenants`
- **THEN** the API creates the tenant and responds with HTTP 201 and the created tenant including `userCount` 0.

#### Scenario: Creating a tenant without sysadmin role
- **WHEN** a user whose role is not `sysadmin` POSTs to `/api/tenants`
- **THEN** the API responds with HTTP 403 and no tenant is created.

#### Scenario: Rejecting an invalid payload
- **WHEN** a client POSTs a tenant payload with a missing `name` or a malformed `rut`
- **THEN** the API responds with HTTP 400 and no tenant is created.

#### Scenario: Rejecting a duplicate RUT
- **WHEN** a client POSTs a tenant whose `rut` already belongs to another tenant
- **THEN** the API responds with HTTP 409 and no tenant is created.

### Requirement: Update tenant
The system SHALL expose `PUT /api/tenants/:id`, restricted to users with the `sysadmin` role, to update `name`, `rut`, `razonSocial`, and `active` of an existing tenant.

#### Scenario: Updating a tenant as sysadmin
- **WHEN** an authenticated `sysadmin` PUTs a valid payload to `/api/tenants/:id` for an existing tenant
- **THEN** the API updates the tenant and responds with HTTP 200 and the updated tenant with its current `userCount`.

#### Scenario: Updating a nonexistent tenant
- **WHEN** a client PUTs to `/api/tenants/:id` with a non-existent tenant id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Updating to a duplicate RUT
- **WHEN** a client updates a tenant to a `rut` that already belongs to another tenant
- **THEN** the API responds with HTTP 409 and no tenant is modified.

### Requirement: Tenants cannot be deleted
The system SHALL NOT expose any endpoint that deletes or removes tenants, and SHALL NOT apply soft-delete semantics (deactivation via `active: false` is an ordinary editable attribute, not a removal).

#### Scenario: No delete endpoint exists
- **WHEN** a client requests `DELETE /api/tenants/:id`
- **THEN** the API responds with HTTP 404 (route does not exist) and no tenant data changes.

#### Scenario: Deactivating is not deleting
- **WHEN** a tenant is edited with `active: false`
- **THEN** the tenant document remains stored and its `userCount` is unaffected.