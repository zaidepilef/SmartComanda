## Purpose

Enables sysadmins to manage branches (sucursales and foodtrucks) through a dedicated API and admin screen, creating branches, assigning them to tenants, and activating or deactivating them.

## ADDED Requirements

### Requirement: List branches
The system SHALL expose `GET /api/branches`, restricted to users with the `sysadmin` role, returning the list of branches. Each branch SHALL include `_id`, `tenantId`, `name`, `type`, `address`, `city`, `phone`, and `active`. The list SHALL be filterable by `tenantId` and by `active` via query parameters, and SHALL be sorted by `name`.

#### Scenario: Listing branches as sysadmin
- **WHEN** an authenticated `sysadmin` GETs `/api/branches`
- **THEN** the API responds with HTTP 200 and the list of branches.

#### Scenario: Filtering branches by tenant
- **WHEN** a `sysadmin` GETs `/api/branches?tenantId=<id>`
- **THEN** the API responds with HTTP 200 and only the branches whose `tenantId` matches the given id.

#### Scenario: Filtering branches by active state
- **WHEN** a `sysadmin` GETs `/api/branches?active=true`
- **THEN** the API responds with HTTP 200 and only the active branches.

#### Scenario: Listing branches as a non-sysadmin
- **WHEN** an authenticated user whose role is not `sysadmin` GETs `/api/branches`
- **THEN** the API responds with HTTP 403 and no branch data is returned.

### Requirement: Create branch
The system SHALL expose `POST /api/branches`, restricted to users with the `sysadmin` role, to create a branch with `tenantId` (required, must reference an existing tenant), `name` (required), `type` (one of `Sucursal` or `FoodTruck`), and optional `address`, `city`, and `phone`. The `active` field SHALL default to `true`.

#### Scenario: Creating a branch as sysadmin
- **WHEN** an authenticated `sysadmin` POSTs a valid branch payload to `/api/branches`
- **THEN** the API creates the branch and responds with HTTP 201 and the created branch.

#### Scenario: Creating a branch without sysadmin role
- **WHEN** a user whose role is not `sysadmin` POSTs to `/api/branches`
- **THEN** the API responds with HTTP 403 and no branch is created.

#### Scenario: Rejecting an invalid payload
- **WHEN** a client POSTs a branch payload with a missing `tenantId`, a missing `name`, or a `type` outside `Sucursal`/`FoodTruck`
- **THEN** the API responds with HTTP 400 and no branch is created.

#### Scenario: Rejecting a branch for a nonexistent tenant
- **WHEN** a client POSTs a branch whose `tenantId` does not reference an existing tenant
- **THEN** the API responds with HTTP 404 and no branch is created.

### Requirement: Update branch
The system SHALL expose `PUT /api/branches/:id`, restricted to users with the `sysadmin` role, to update `tenantId`, `name`, `type`, `address`, `city`, `phone`, and `active` of an existing branch. Changing `tenantId` SHALL reassign the branch to another tenant.

#### Scenario: Updating a branch as sysadmin
- **WHEN** an authenticated `sysadmin` PUTs a valid payload to `/api/branches/:id` for an existing branch
- **THEN** the API updates the branch and responds with HTTP 200 and the updated branch.

#### Scenario: Updating a nonexistent branch
- **WHEN** a client PUTs to `/api/branches/:id` with a non-existent branch id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Reassigning a branch to another tenant
- **WHEN** an authenticated `sysadmin` updates a branch with a new `tenantId` referencing an existing tenant
- **THEN** the branch's `tenantId` changes and the API responds with HTTP 200.

#### Scenario: Updating a branch to a nonexistent tenant
- **WHEN** a client updates a branch to a `tenantId` that does not reference an existing tenant
- **THEN** the API responds with HTTP 404 and no branch is modified.

### Requirement: Branches cannot be deleted
The system SHALL NOT expose any endpoint that deletes or removes branches, and SHALL NOT apply soft-delete semantics beyond the `active` attribute (deactivation via `active: false` is an ordinary editable attribute).

#### Scenario: No delete endpoint exists
- **WHEN** a client requests `DELETE /api/branches/:id`
- **THEN** the API responds with HTTP 404 (route does not exist) and no branch data changes.

#### Scenario: Deactivating is not deleting
- **WHEN** a branch is updated with `active: false`
- **THEN** the branch document remains stored and continues to appear in unfiltered listings.

### Requirement: Tenant list branch navigation
The admin UI SHALL display, in the tenants list, the branch count of each tenant and a button per tenant that navigates to the branches screen with that tenant preselected in the tenant combobox. In the current MVP the button and the count SHALL be visible to all authenticated roles; role-based restriction of this navigation is deferred.

#### Scenario: Navigating from a tenant to its branches
- **WHEN** an authenticated user clicks the branches button of a tenant in the tenants list
- **THEN** the application navigates to the branches screen with the tenant combobox preselected to that tenant and the branch list filtered to it.

#### Scenario: Branch count shown in the tenant list
- **WHEN** the tenants list renders
- **THEN** each row displays the number of branches referencing the tenant.
