# ingredient-catalog Specification

## Purpose

Lets owners and admins maintain the catalog of raw ingredients used to assemble dishes, each with its measurement unit, measurement dimension, and unit cost.

## Requirements

### Requirement: Create ingredient
The system SHALL allow an `owner` or `admin` user to create an ingredient with a unique name, a measurement unit (e.g., `unidad`, `gramos`, `litros`), a measurement dimension (`count`, `mass`, `volume`), and an optional reference unit cost.

#### Scenario: Creating a valid ingredient
- **WHEN** an `owner` or `admin` creates an ingredient with a name, unit, dimension `count`, and a positive reference unit cost
- **THEN** the ingredient is stored and appears in the ingredient catalog

#### Scenario: Creating an ingredient without a reference cost
- **WHEN** an `owner` or `admin` creates an ingredient without a reference unit cost
- **THEN** the ingredient is stored without a reference cost

#### Scenario: Rejecting a duplicate ingredient name
- **WHEN** an `owner` or `admin` creates an ingredient whose name already exists
- **THEN** the system rejects the creation with an error

#### Scenario: Rejecting an invalid dimension
- **WHEN** an ingredient is created with a dimension other than `count`, `mass`, or `volume`
- **THEN** the system rejects the creation with an error

#### Scenario: Rejecting a non-positive unit cost
- **WHEN** an ingredient is created with a reference unit cost less than zero
- **THEN** the system rejects the creation with an error

### Requirement: List and update ingredients
The system SHALL allow `owner` and `admin` users to list all ingredients of their tenant and update an ingredient's name, unit, dimension, and reference unit cost. Updating the reference unit cost SHALL NOT change existing purchase batches or dish costs, which derive from batches.

#### Scenario: Listing tenant ingredients
- **WHEN** an `owner` or `admin` requests the ingredient list
- **THEN** the system returns all ingredients belonging to their tenant, and no ingredients from other tenants

#### Scenario: Updating an ingredient
- **WHEN** an `owner` or `admin` updates the reference unit cost of an ingredient
- **THEN** the change is stored and reflected in subsequent listings, while existing batches and dish costs remain unchanged

#### Scenario: Updating an ingredient used by a dish
- **WHEN** an `owner` or `admin` updates the unit or dimension of an ingredient that is referenced by existing dishes
- **THEN** the system rejects the update unless all dish quantities are compatible with the new unit

### Requirement: Ingredient access control
The system SHALL restrict ingredient management to `owner` and `admin` roles; `cashier` users SHALL NOT create, update, or delete ingredients.

#### Scenario: Cashier cannot manage ingredients
- **WHEN** a `cashier` attempts to create or update an ingredient
- **THEN** the system rejects the request with an authorization error

#### Scenario: Cross-tenant access is blocked
- **WHEN** an `owner` attempts to list or update ingredients belonging to another tenant
- **THEN** the system rejects the request
