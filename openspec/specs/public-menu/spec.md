# public-menu Specification

## Purpose

Exposes a public read-only menu for a tenant's branch so customers can order without an account: validated tenant and branch, active dishes only, and the branch's effective sale price.

## Requirements

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

### Requirement: No sensitive data in the public menu
The public menu SHALL NOT expose stock, recipes, ingredient costs, users, or any data beyond the dish catalog fields, prices, and business/branch names.

#### Scenario: Recipe and inventory stay private
- **WHEN** a customer requests the public menu
- **THEN** the response contains no recipe, ingredient, stock, or cost data

### Requirement: Public endpoint protection
Public endpoints SHALL validate all inputs with the same validation layer as authenticated routes and SHALL be rate limited.

#### Scenario: Invalid input is rejected
- **WHEN** a request provides malformed `tenantId` or `branchId`
- **THEN** the endpoint rejects it with a validation error

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
