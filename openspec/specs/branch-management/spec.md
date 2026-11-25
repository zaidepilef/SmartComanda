# branch-management Specification

## Purpose

Enables sysadmins to manage branches (sucursales and foodtrucks) through a dedicated API and admin screen, creating branches, assigning them to tenants, and activating or deactivating them.

## Requirements

### Requirement: List branches
The system SHALL expose `GET /api/branches`, restricted to users with the `sysadmin`, `admin`, or `owner` roles, returning the list of branches. Each branch SHALL include `_id`, `tenantId`, `name`, `type`, `address`, `city`, `phone`, and `active`. The list SHALL be filterable by `tenantId`, by `active`, and by `q` (case-insensitive substring match on `name`) via query parameters, and SHALL be sorted by `name`. The list SHALL be tenant-scoped: a `sysadmin` SHALL receive branches of any tenant, while an `admin` or `owner` SHALL only receive branches whose `tenantId` matches its own tenant.

#### Scenario: Listing branches as sysadmin
- **WHEN** an authenticated `sysadmin` GETs `/api/branches`
- **THEN** the API responds with HTTP 200 and the list of branches.

#### Scenario: Filtering branches by tenant
- **WHEN** a `sysadmin` GETs `/api/branches?tenantId=<id>`
- **THEN** the API responds with HTTP 200 and only the branches whose `tenantId` matches the given id.

#### Scenario: Filtering branches by active state
- **WHEN** a `sysadmin` GETs `/api/branches?active=true`
- **THEN** the API responds with HTTP 200 and only the active branches.

#### Scenario: Searching branches by name
- **WHEN** a user GETs `/api/branches?q=<text>`
- **THEN** the API responds with HTTP 200 and only the branches whose `name` contains the given text, ignoring case.

#### Scenario: Listing branches as a tenant-scoped manager
- **WHEN** an authenticated `admin` or `owner` GETs `/api/branches`
- **THEN** the API responds with HTTP 200 and only the branches whose `tenantId` matches the user's own tenant, regardless of any `tenantId` query parameter.

#### Scenario: Listing branches as a non-manager role
- **WHEN** an authenticated user whose role is not `sysadmin`, `admin`, or `owner` GETs `/api/branches`
- **THEN** the API responds with HTTP 403 and no branch data is returned.

### Requirement: Create branch
The system SHALL expose `POST /api/branches`, restricted to users with the `sysadmin`, `admin`, or `owner` roles, to create a branch with `tenantId` (required, must reference an existing tenant), `name` (required), `type` (one of `Sucursal` or `FoodTruck`), and optional `address`, `city`, and `phone`. The `active` field SHALL default to `true`. An `admin` or `owner` SHALL only create branches whose `tenantId` matches its own tenant; a `sysadmin` SHALL create branches for any tenant.

#### Scenario: Creating a branch as sysadmin
- **WHEN** an authenticated `sysadmin` POSTs a valid branch payload to `/api/branches`
- **THEN** the API creates the branch and responds with HTTP 201 and the created branch.

#### Scenario: Creating a branch in the own tenant
- **WHEN** an authenticated `admin` or `owner` POSTs a valid branch payload whose `tenantId` matches its own tenant
- **THEN** the API creates the branch and responds with HTTP 201 and the created branch.

#### Scenario: Creating a branch outside the own tenant
- **WHEN** an authenticated `admin` or `owner` POSTs a branch payload whose `tenantId` does not match its own tenant
- **THEN** the API responds with HTTP 403 and no branch is created.

#### Scenario: Rejecting an invalid payload
- **WHEN** a client POSTs a branch payload with a missing `tenantId`, a missing `name`, or a `type` outside `Sucursal`/`FoodTruck`
- **THEN** the API responds with HTTP 400 and no branch is created.

#### Scenario: Rejecting a branch for a nonexistent tenant
- **WHEN** a client POSTs a branch whose `tenantId` does not reference an existing tenant
- **THEN** the API responds with HTTP 404 and no branch is created.

#### Scenario: Creating a branch as a non-manager role
- **WHEN** a user whose role is not `sysadmin`, `admin`, or `owner` POSTs to `/api/branches`
- **THEN** the API responds with HTTP 403 and no branch is created.

### Requirement: Update branch
The system SHALL expose `PUT /api/branches/:id`, restricted to users with the `sysadmin`, `admin`, or `owner` roles, to update `tenantId`, `name`, `type`, `address`, `city`, `phone`, and `active` of an existing branch. Only a `sysadmin` SHALL change `tenantId`; an `admin` or `owner` SHALL only update branches whose `tenantId` matches its own tenant and SHALL NOT change `tenantId` in the payload.

#### Scenario: Updating a branch as sysadmin
- **WHEN** an authenticated `sysadmin` PUTs a valid payload to `/api/branches/:id` for an existing branch
- **THEN** the API updates the branch and responds with HTTP 200 and the updated branch.

#### Scenario: Updating a branch in the own tenant
- **WHEN** an authenticated `admin` or `owner` PUTs a valid payload to `/api/branches/:id` for a branch of its own tenant
- **THEN** the API updates the branch and responds with HTTP 200 and the updated branch.

#### Scenario: Updating a branch of another tenant
- **WHEN** an authenticated `admin` or `owner` PUTs to `/api/branches/:id` for a branch that belongs to another tenant
- **THEN** the API responds with HTTP 403 and no branch is modified.

#### Scenario: Reassigning a branch to another tenant
- **WHEN** an authenticated `sysadmin` updates a branch with a new `tenantId` referencing an existing tenant
- **THEN** the branch's `tenantId` changes and the API responds with HTTP 200.

#### Scenario: A tenant-scoped manager reassigning a branch
- **WHEN** an authenticated `admin` or `owner` updates a branch of its own tenant including a `tenantId` different from its own tenant
- **THEN** the API responds with HTTP 403 and no branch is modified.

#### Scenario: Updating a branch to a nonexistent tenant
- **WHEN** a client updates a branch to a `tenantId` that does not reference an existing tenant
- **THEN** the API responds with HTTP 404 and no branch is modified.

#### Scenario: Updating a nonexistent branch
- **WHEN** a client PUTs to `/api/branches/:id` with a non-existent branch id
- **THEN** the API responds with HTTP 404 and an error message.

### Requirement: Get branch by id
The system SHALL expose `GET /api/branches/:id`, restricted to users with the `sysadmin`, `admin`, or `owner` roles, returning the branch with the given id. An `admin` or `owner` SHALL only retrieve branches whose `tenantId` matches its own tenant; a `sysadmin` SHALL retrieve any branch.

#### Scenario: Retrieving a branch as sysadmin
- **WHEN** an authenticated `sysadmin` GETs `/api/branches/:id` for an existing branch
- **THEN** the API responds with HTTP 200 and the branch data.

#### Scenario: Retrieving a branch of the own tenant
- **WHEN** an authenticated `admin` or `owner` GETs `/api/branches/:id` for a branch of its own tenant
- **THEN** the API responds with HTTP 200 and the branch data.

#### Scenario: Retrieving a branch of another tenant
- **WHEN** an authenticated `admin` or `owner` GETs `/api/branches/:id` for a branch that belongs to another tenant
- **THEN** the API responds with HTTP 403 and no branch data is returned.

#### Scenario: Retrieving a nonexistent branch
- **WHEN** a client GETs `/api/branches/:id` with a non-existent branch id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Retrieving a branch as a non-manager role
- **WHEN** a user whose role is not `sysadmin`, `admin`, or `owner` GETs `/api/branches/:id`
- **THEN** the API responds with HTTP 403 and no branch data is returned.

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

### Requirement: Branch payment methods
Each branch SHALL declare the payment methods it works with, a subset of `cash`, `debit`, `credit`, and `transfer`. When not specified, the branch SHALL accept all four. `sysadmin`, `admin`, and `owner` users SHALL be able to set the payment methods when creating or updating a branch, and the branch listing SHALL include them. The POS SHALL offer only the branch's methods at checkout.

#### Scenario: Creating a branch without payment methods
- **WHEN** a branch is created without `paymentMethods`
- **THEN** the branch accepts `cash`, `debit`, `credit`, and `transfer`

#### Scenario: Setting payment methods on creation
- **WHEN** a `sysadmin` creates a branch with `paymentMethods` `["cash", "debit"]`
- **THEN** the branch is stored accepting only cash and debit

#### Scenario: Updating a branch's payment methods
- **WHEN** an `owner` updates a branch's `paymentMethods` to `["cash", "transfer"]`
- **THEN** the change is stored and reflected in subsequent listings

#### Scenario: Rejecting an invalid payment method
- **WHEN** a branch is created or updated with a payment method outside the four supported values
- **THEN** the system rejects the request with an error

### Requirement: POS branch listing access
The system SHALL allow `cashier` users to list the active branches of their own tenant, including each branch's `paymentMethods`, so the POS can resolve the branch context. `cashier` users SHALL NOT create, update, or delete branches.

#### Scenario: Cashier lists own tenant's branches
- **WHEN** a `cashier` requests the branch list
- **THEN** the system returns the active branches of their tenant with their payment methods

#### Scenario: Cashier cannot modify branches
- **WHEN** a `cashier` attempts to create, update, or delete a branch
- **THEN** the system rejects the request with an authorization error

### Requirement: Branch geolocation
The system SHALL let `sysadmin`, `owner`, and `admin` users store a branch's exact location as `lat` (−90 to 90) and `lng` (−180 to 180) through branch create and update. Both values SHALL be sent together or not at all. The admin panel SHALL let the user enter the location as coordinates, by pasting a Google Maps URL containing coordinates, or by placing a marker on a map.

#### Scenario: Saving coordinates
- **WHEN** a manager updates a branch with `lat` -33.4372 and `lng` -70.6506
- **THEN** the branch stores and returns those coordinates

#### Scenario: Only one coordinate is rejected
- **WHEN** a request sends `lat` without `lng`
- **THEN** the API rejects it with a validation error

#### Scenario: Pasting a Google Maps link
- **WHEN** a manager pastes a full Google Maps URL that contains `@-33.4372,-70.6506`
- **THEN** the admin fills the coordinates and moves the map marker to that point

#### Scenario: Short Google Maps link
- **WHEN** a manager pastes a `maps.app.goo.gl` link
- **THEN** the admin explains that the full URL is needed and does not request the link from the server

### Requirement: Branch delivery limits
Each branch SHALL store optional delivery limits `deliveryMaxKm` (greater than 0), `deliveryMaxMinutes` (greater than 0), and `deliveryAvgSpeedKmh` (5 to 120, default 25), editable from the admin panel together with the location.

#### Scenario: Default average speed
- **WHEN** a branch is created without `deliveryAvgSpeedKmh`
- **THEN** the branch returns `deliveryAvgSpeedKmh` 25

#### Scenario: Clearing a limit
- **WHEN** a manager updates a branch with `deliveryMaxKm` null
- **THEN** the branch has no distance limit
