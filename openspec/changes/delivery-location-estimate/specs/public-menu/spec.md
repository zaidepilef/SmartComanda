## ADDED Requirements

### Requirement: Public delivery estimate endpoint
The system SHALL provide `POST /api/public/delivery-estimate` taking `tenantId`, `branchId`, `lat`, and `lng`, validated and rate limited like the other public endpoints, that returns `distanceKm`, `etaMinutes`, and `outOfRange` for an active branch. The response SHALL NOT include the branch coordinates or delivery limits.

#### Scenario: Estimate for an active branch
- **WHEN** a customer requests an estimate for an active branch with coordinates
- **THEN** the response contains `distanceKm`, `etaMinutes`, and `outOfRange` only

#### Scenario: Branch without coordinates
- **WHEN** the branch has no coordinates
- **THEN** the response is `{ "estimate": null }`

#### Scenario: Invalid coordinates
- **WHEN** `lat` is outside −90 to 90
- **THEN** the endpoint rejects the request with a validation error
