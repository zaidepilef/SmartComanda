# dish-recipes Specification

## Purpose

Lets owners and admins define sellable dishes (hotdog, hamburger, sandwich, french fries) as recipes made of ingredients with quantities, with the dish cost computed automatically from ingredient unit costs.

## Requirements

### Requirement: Create dish recipe
The system SHALL allow an `owner` or `admin` user to create a dish with a name, a default sale price, optional per-branch sale prices, and a list of recipe lines, where each line references an existing ingredient, a quantity, and the unit of that ingredient.

#### Scenario: Creating a dish from valid ingredients
- **WHEN** an `owner` or `admin` creates a dish named "Hotdog Clásico" with a default sale price, recipe lines for Pan (1 unidad), Salchicha (1 unidad), and Tomate (50 gramos), all referencing existing ingredients
- **THEN** the dish is stored with its recipe and appears in the dish catalog

#### Scenario: Creating a dish with a branch price
- **WHEN** an `owner` or `admin` creates a dish and sets a sale price override for one branch
- **THEN** the dish is stored with its default price and the branch override

#### Scenario: Rejecting a dish referencing a missing ingredient
- **WHEN** a dish recipe line references an ingredient that does not exist
- **THEN** the system rejects the creation with an error

#### Scenario: Rejecting a non-positive quantity
- **WHEN** a dish recipe line has a quantity of zero or less
- **THEN** the system rejects the creation with an error

#### Scenario: Rejecting a mismatched unit
- **WHEN** a dish recipe line uses a unit that does not match the ingredient's dimension (e.g., a `count` ingredient measured in liters)
- **THEN** the system rejects the creation with an error

### Requirement: Automatic dish cost calculation
The system SHALL compute the dish cost per branch as the sum of each recipe line's quantity multiplied by the FIFO cost of the ingredient in that branch, using the purchase batches that would be consumed by a sale at that branch at the time of calculation.

#### Scenario: Computing dish cost from current batches
- **WHEN** a branch holds batches of Pan at $300, Salchicha at $800, and Tomate at $2000/kg, and a dish has lines Pan (1), Salchicha (1), Tomate (50g)
- **THEN** the dish cost in that branch is computed as $300 + $800 + $100 = $1200

#### Scenario: Dish cost differs per branch
- **WHEN** the same dish is evaluated in a distant branch where Pan batches cost $303 due to delivery surcharges
- **THEN** the dish cost in that branch reflects the higher FIFO cost

#### Scenario: Dish cost reflects batch exhaustion
- **WHEN** the oldest batch of an ingredient is fully consumed
- **THEN** the dish cost in that branch reflects the next-oldest batch's cost

### Requirement: List and update dishes
The system SHALL allow `owner` and `admin` users to list all dishes of their tenant and update a dish's name, default sale price, per-branch sale prices, and recipe lines.

#### Scenario: Updating a dish recipe
- **WHEN** an `owner` or `admin` adds an ingredient line to an existing dish
- **THEN** the change is stored and dish costs are computed from batches on next evaluation

#### Scenario: Updating a branch sale price
- **WHEN** an `owner` or `admin` updates the sale price override of a dish for a branch
- **THEN** the change is stored and subsequent orders in that branch use the new price

#### Scenario: Listing tenant dishes
- **WHEN** an `owner` or `admin` requests the dish list
- **THEN** the system returns all dishes belonging to their tenant, and no dishes from other tenants

### Requirement: Per-branch dish sale prices
The system SHALL allow `owner` and `admin` users to set a default sale price per dish and override it per branch. Order checkout SHALL use the branch's sale price, falling back to the default when no override exists.

#### Scenario: Checkout uses the branch price
- **WHEN** an order is placed in a branch that has a sale price override for the dish
- **THEN** the order item price is the branch's override price

#### Scenario: Checkout falls back to the default price
- **WHEN** an order is placed in a branch without a sale price override for the dish
- **THEN** the order item price is the dish's default sale price

#### Scenario: Removing a branch price override
- **WHEN** an `owner` or `admin` removes a branch sale price override
- **THEN** subsequent orders in that branch use the default sale price

### Requirement: Dish access control
The system SHALL restrict dish management to `owner` and `admin` roles; `cashier` users SHALL NOT create, update, or delete dishes.

#### Scenario: Cashier cannot manage dishes
- **WHEN** a `cashier` attempts to create or update a dish
- **THEN** the system rejects the request with an authorization error
