# dish-recipes Specification

## Purpose

Lets owners and admins define sellable dishes (hotdog, hamburger, sandwich, french fries) as recipes made of ingredients with quantities, with the dish cost computed automatically from ingredient unit costs.

## Requirements

### Requirement: Create dish recipe
The system SHALL allow an `owner` or `admin` user to create a dish with a name, a sale price, and a list of recipe lines, where each line references an existing ingredient, a quantity, and the unit of that ingredient.

#### Scenario: Creating a dish from valid ingredients
- **WHEN** an `owner` or `admin` creates a dish named "Hotdog Clásico" with recipe lines for Pan (1 unidad), Salchicha (1 unidad), and Tomate (50 gramos), all referencing existing ingredients
- **THEN** the dish is stored with its recipe and appears in the dish catalog

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
The system SHALL compute the dish cost automatically as the sum of each recipe line's quantity multiplied by the ingredient's unit cost, and SHALL keep it updated when ingredient unit costs change.

#### Scenario: Computing dish cost on creation
- **WHEN** a dish is created with Pan at $500/unidad, Salchicha at $800/unidad, and Tomate at $2000/kg with a 50g line
- **THEN** the dish cost is computed as $500 + $800 + $100 = $1400

#### Scenario: Dish cost reflects ingredient cost changes
- **WHEN** an ingredient unit cost used by a dish is updated
- **THEN** the dish cost is recomputed with the new cost

### Requirement: List and update dishes
The system SHALL allow `owner` and `admin` users to list all dishes of their tenant and update a dish's name, sale price, and recipe lines.

#### Scenario: Updating a dish recipe
- **WHEN** an `owner` or `admin` adds an ingredient line to an existing dish
- **THEN** the dish cost is recomputed and the change is stored

#### Scenario: Listing tenant dishes
- **WHEN** an `owner` or `admin` requests the dish list
- **THEN** the system returns all dishes belonging to their tenant, and no dishes from other tenants

### Requirement: Dish access control
The system SHALL restrict dish management to `owner` and `admin` roles; `cashier` users SHALL NOT create, update, or delete dishes.

#### Scenario: Cashier cannot manage dishes
- **WHEN** a `cashier` attempts to create or update a dish
- **THEN** the system rejects the request with an authorization error
