## MODIFIED Requirements

### Requirement: Public menu listing
The system SHALL provide a public endpoint `GET /api/public/menu` that takes `tenantId` and `branchId`, validates that the branch exists, belongs to the tenant, and is `active`, and SHALL return the tenant's business name, the branch name, the branch's enabled payment methods, `deliveryAvailable`, and the list of `active` dishes (id, name, description, icon, category) with the effective sale price for that branch. `deliveryAvailable` SHALL be `true` only when the branch has coordinates and at least one of `deliveryMaxKm` or `deliveryMaxMinutes`; the response SHALL NOT include the coordinates or the limits.

#### Scenario: Listing the menu of an active branch
- **WHEN** a customer requests the menu of an active branch that belongs to the tenant
- **THEN** the response contains the business name, branch name, payment methods, `deliveryAvailable`, and the tenant's active dishes with their branch-effective prices

#### Scenario: Branch price override takes precedence
- **WHEN** the branch has a `branchPrices` override for a dish
- **THEN** the menu shows the override price instead of the dish's default `salePrice`

#### Scenario: Excluding inactive dishes
- **WHEN** a dish is marked inactive
- **THEN** the dish does not appear in the public menu

#### Scenario: Branch without delivery configuration
- **WHEN** the branch has no coordinates or no delivery limit
- **THEN** `deliveryAvailable` is `false`

#### Scenario: Rejecting an unknown or inactive branch
- **WHEN** the branch does not exist, belongs to another tenant, or is inactive
- **THEN** the endpoint rejects the request with an error and exposes no menu data
