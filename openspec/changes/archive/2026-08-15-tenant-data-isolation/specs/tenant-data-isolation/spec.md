## Purpose

Establishes tenant data isolation for SmartComanda: a user with a `tenantId` only accesses data from its own tenant, while `sysadmin` users operate globally across all tenants.

## ADDED Requirements

### Requirement: Tenant-scoped data access
The system SHALL scope authenticated data access by tenant: a non-sysadmin user SHALL only read and operate on data whose `tenantId` matches its own `tenantId`. A `sysadmin` user SHALL access data across all tenants without tenant filtering.

#### Scenario: Tenant user only sees its own tenant data
- **WHEN** a non-sysadmin authenticated user requests data through a tenant-scoped endpoint
- **THEN** the API returns only records whose `tenantId` matches the user's own `tenantId`.

#### Scenario: Sysadmin sees all tenants' data
- **WHEN** an authenticated `sysadmin` requests data through a tenant-scoped endpoint
- **THEN** the API returns records across all tenants without applying tenant filtering.

#### Scenario: Cross-tenant resource access is rejected
- **WHEN** a non-sysadmin authenticated user requests a specific resource that belongs to another tenant or to no tenant
- **THEN** the API responds with HTTP 403 and no data is returned.

### Requirement: Global sysadmin visibility
The system SHALL treat users with no `tenantId` (the `sysadmin` role) as global actors, and SHALL exclude them from the tenant-scoped results of other users.

#### Scenario: Sysadmin records are invisible to tenant users
- **WHEN** a non-sysadmin user lists tenant-scoped data
- **THEN** records belonging to users without a `tenantId` are not included in the results.

#### Scenario: Tenant filter matches the actor's tenantId
- **WHEN** a non-sysadmin user lists tenant-scoped data
- **THEN** the list is filtered by the actor's own `tenantId` and never by a tenant supplied by the client.
