## Purpose

Provides a minimal tenants read capability for the admin UI — the API lists tenants so the sysadmin can assign users to a tenant when creating or editing users, backed by the `tenants` collection created by the data model migration.

## ADDED Requirements

### Requirement: List tenants
The system SHALL expose `GET /api/tenants` returning the list of tenants, requiring a valid Bearer token. Each tenant SHALL include `_id`, `name`, `rut`, `razonSocial`, and `active`.

#### Scenario: Listing tenants as sysadmin
- **WHEN** an authenticated `sysadmin` GETs `/api/tenants`
- **THEN** the API responds with HTTP 200 and the list of active and inactive tenants.

#### Scenario: Listing tenants without authentication
- **WHEN** a client GETs `/api/tenants` without a valid Bearer token
- **THEN** the API responds with HTTP 401 and no tenant data is returned.

#### Scenario: Listing only active tenants for assignment
- **WHEN** the admin UI requests tenants to populate a user-assignment selector
- **THEN** the API supports filtering the list to only active tenants (e.g., `GET /api/tenants?active=true`).