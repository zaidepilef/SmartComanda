# inventory-management Specification

## Purpose

Manages each tenant's warehouse: either a single shared stock pool or one stock pool per branch (food truck), with stock levels, manual adjustments, and a movement audit trail.

## Requirements

### Requirement: Warehouse mode configuration
The system SHALL allow an `owner` to configure the tenant's warehouse mode as either `shared` (one stock pool for the whole tenant) or `per_branch` (each branch has its own stock pool).

#### Scenario: Setting shared mode
- **WHEN** an `owner` sets the warehouse mode to `shared`
- **THEN** all stock records resolve against a single tenant-level pool with no branch

#### Scenario: Setting per-branch mode
- **WHEN** an `owner` sets the warehouse mode to `per_branch`
- **THEN** stock records are tracked per branch, and lookups require a branch reference

### Requirement: Blocking warehouse mode changes with existing stock
The system SHALL block changing the warehouse mode when any stock record exists for the tenant.

#### Scenario: Mode change blocked by existing stock
- **WHEN** an `owner` attempts to change the warehouse mode and the tenant has at least one stock record
- **THEN** the system rejects the change with an error explaining that stock must be cleared first

#### Scenario: Mode change allowed with no stock
- **WHEN** an `owner` changes the warehouse mode and the tenant has no stock records
- **THEN** the change is stored and applied

### Requirement: Stock levels
The system SHALL track a stock level per ingredient (and per branch when in `per_branch` mode), where the level is expressed in the ingredient's measurement unit.

#### Scenario: Viewing stock in shared mode
- **WHEN** an `owner` or `admin` views stock in `shared` mode
- **THEN** the system shows one quantity per ingredient for the tenant

#### Scenario: Viewing stock in per-branch mode
- **WHEN** an `owner` or `admin` views stock in `per_branch` mode
- **THEN** the system shows one quantity per ingredient per branch

### Requirement: Manual stock adjustments
The system SHALL allow `owner` and `admin` users to adjust stock manually: an entry (e.g., purchase) increases the quantity and an exit (e.g., waste, spoilage) decreases it, each requiring a reason.

#### Scenario: Recording a purchase
- **WHEN** an `owner` or `admin` records a stock entry of 10kg of tomatoes with a purchase reason
- **THEN** the stock quantity increases by 10kg and a movement record is created

#### Scenario: Recording a waste exit
- **WHEN** an `owner` or `admin` records a stock exit of 0.5kg of spoiled tomatoes with a waste reason
- **THEN** the stock quantity decreases by 0.5kg and a movement record is created

#### Scenario: Rejecting an adjustment without a reason
- **WHEN** a stock adjustment is submitted without a reason
- **THEN** the system rejects the adjustment with an error

### Requirement: Stock movement audit
The system SHALL record every stock change (manual adjustment or sale deduction) as a movement with the ingredient, branch (when applicable), quantity change, reason, related order (when applicable), user, and timestamp, and SHALL allow `owner` and `admin` to view the movement history.

#### Scenario: Viewing movement history
- **WHEN** an `owner` or `admin` requests the movement history for an ingredient
- **THEN** the system returns all movements for that ingredient in chronological order with their reasons

### Requirement: Inventory access control
The system SHALL restrict inventory management to `owner` and `admin` roles; `cashier` users SHALL NOT adjust stock or change warehouse configuration.

#### Scenario: Cashier cannot adjust stock
- **WHEN** a `cashier` attempts a manual stock adjustment
- **THEN** the system rejects the request with an authorization error

#### Scenario: Cross-tenant stock is blocked
- **WHEN** an `owner` attempts to view or adjust stock belonging to another tenant
- **THEN** the system rejects the request
