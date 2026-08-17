# public-menu Specification

## Purpose

Exposes a public read-only menu for a tenant's branch so customers can order without an account: validated tenant and branch, active dishes only, and the branch's effective sale price.

## Requirements

### Requirement: Public menu listing
The system SHALL provide a public endpoint `GET /api/public/menu` that takes `tenantId` and `branchId`, validates that the branch exists, belongs to the tenant, and is `active`, and SHALL return the tenant's business name, the branch name, and the list of `active` dishes (id, name, description, icon, category) with the effective sale price for that branch.

#### Scenario: Listing the menu of an active branch
- **WHEN** a customer requests the menu of an active branch that belongs to the tenant
- **THEN** the response contains the business name, branch name, and the tenant's active dishes with their branch-effective prices

#### Scenario: Branch price override takes precedence
- **WHEN** the branch has a `branchPrices` override for a dish
- **THEN** the menu shows the override price instead of the dish's default `salePrice`

#### Scenario: Excluding inactive dishes
- **WHEN** a dish is marked inactive
- **THEN** the dish does not appear in the public menu

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