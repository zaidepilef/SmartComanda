## MODIFIED Requirements

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
