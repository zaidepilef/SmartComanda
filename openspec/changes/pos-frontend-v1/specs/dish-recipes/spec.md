## ADDED Requirements

### Requirement: Dish catalog metadata
Each dish SHALL carry optional `category` and `icon` metadata. When not provided, `category` SHALL default to `general` and `icon` SHALL default to `🍽️`. `owner` and `admin` users SHALL be able to set `category` and `icon` when creating or updating a dish.

#### Scenario: Creating a dish without metadata
- **WHEN** an `owner` or `admin` creates a dish without a `category` or `icon`
- **THEN** the dish is stored with category `general` and icon `🍽️`

#### Scenario: Setting a category and icon
- **WHEN** an `owner` or `admin` creates a dish with category `completos` and icon `🌭`
- **THEN** the dish is stored with those values

#### Scenario: Updating category and icon
- **WHEN** an `owner` or `admin` updates a dish's `category` and `icon`
- **THEN** the change is stored and reflected in subsequent listings

### Requirement: Read-only dish catalog for POS roles
The system SHALL allow `cashier` and `sysadmin` users to list dishes, including `name`, `salePrice`, `category`, `icon`, and `active`, scoped to the tenant they operate in. `cashier` and `sysadmin` users SHALL NOT create, update, or delete dishes.

#### Scenario: Cashier lists the dish catalog
- **WHEN** a `cashier` requests the dish list for their tenant
- **THEN** the system returns the dishes of that tenant with name, sale price, category, icon, and active state

#### Scenario: sysadmin lists a tenant's dishes
- **WHEN** a `sysadmin` requests the dish list for a tenant
- **THEN** the system returns that tenant's dishes

#### Scenario: Cashier cannot modify dishes
- **WHEN** a `cashier` attempts to create, update, or delete a dish
- **THEN** the system rejects the request with an authorization error