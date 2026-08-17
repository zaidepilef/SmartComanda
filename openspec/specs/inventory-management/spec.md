# inventory-management Specification

## Purpose

Manages each tenant's warehouse: either a single shared stock pool or one stock pool per branch (food truck), with stock levels, manual adjustments, and a movement audit trail.

## Requirements

### Requirement: Stock levels
The system SHALL track a stock level per ingredient per branch, expressed in the ingredient's measurement unit.

#### Scenario: Viewing stock per branch
- **WHEN** an `owner` or `admin` views stock for a branch
- **THEN** the system shows one quantity per ingredient for that branch

#### Scenario: Viewing stock across branches
- **WHEN** an `owner` or `admin` views the tenant's stock overview
- **THEN** the system shows quantities grouped by branch and the total per ingredient across branches

### Requirement: Manual stock adjustments
The system SHALL allow `owner` and `admin` users to adjust stock manually per branch: an entry (e.g., purchase) increases the quantity and records the landed unit cost paid, and an exit (e.g., waste, spoilage) decreases the quantity, each requiring a reason.

#### Scenario: Recording a purchase with cost
- **WHEN** an `owner` or `admin` records a purchase of 10kg of tomatoes at $2000/kg for a branch with a purchase reason
- **THEN** the branch stock increases by 10kg, a new batch with that quantity and landed unit cost is created, and a movement record is created

#### Scenario: Recording a purchase including freight
- **WHEN** an `owner` or `admin` records a purchase of 300 buns at $303 each because the supplier charges $3 delivery per unit to that branch
- **THEN** the batch is created with the landed unit cost of $303

#### Scenario: Recording a waste exit
- **WHEN** an `owner` or `admin` records a stock exit of 0.5kg of spoiled tomatoes with a waste reason
- **THEN** the branch stock decreases by 0.5kg, consumed from the oldest batch first, and a movement record is created

#### Scenario: Rejecting an adjustment without a reason
- **WHEN** a stock adjustment is submitted without a reason
- **THEN** the system rejects the adjustment with an error

#### Scenario: Rejecting a purchase without a unit cost
- **WHEN** a stock entry is submitted without a landed unit cost
- **THEN** the system rejects the entry with an error

### Requirement: Stock movement audit
The system SHALL record every stock change (manual adjustment or sale deduction) as a movement with the ingredient, branch, quantity change, landed unit cost, batch (when applicable), reason, related order (when applicable), user, and timestamp, and SHALL allow `owner` and `admin` to view the movement history.

#### Scenario: Viewing movement history
- **WHEN** an `owner` or `admin` requests the movement history for an ingredient
- **THEN** the system returns all movements for that ingredient in chronological order with their reasons, costs, and batches

### Requirement: Purchase batches
The system SHALL model each stock entry as a batch owned by a branch, with the entered quantity and the landed unit cost, and SHALL track the remaining quantity of each batch as it is consumed.

#### Scenario: Batches are created per purchase
- **WHEN** a purchase of 1500 buns at $300 each is recorded for a branch
- **THEN** a batch exists with quantity 1500, remaining quantity 1500, and unit cost $300 for that branch

#### Scenario: Batches keep costs separate
- **WHEN** a later purchase of 450 buns at $303 each is recorded for the same branch
- **THEN** a second batch exists and each batch keeps its own cost

#### Scenario: Batches are branch-scoped
- **WHEN** purchases of the same ingredient are recorded in two different branches at different costs
- **THEN** each branch has its own batches with its own costs

### Requirement: FIFO consumption
The system SHALL consume stock from the oldest batches first (FIFO) whenever stock exits occur, whether from manual adjustments or sale deductions, and SHALL record which batches were consumed.

#### Scenario: Consumption applies the oldest batch
- **WHEN** 300 buns are consumed from stock holding batch 1 (1500 @ $300) and batch 2 (450 @ $303)
- **THEN** the exit is charged to batch 1, whose remaining quantity drops to 1200

#### Scenario: Consumption crosses batches
- **WHEN** 2000 buns are consumed from stock holding batch 1 (1500 @ $300) and batch 2 (450 @ $303)
- **THEN** batch 1 is fully consumed and 500 buns are taken from batch 2, and the movement records the cost breakdown

#### Scenario: FIFO cost drives dish costing
- **WHEN** a sale deduction consumes 1 bun from batch 1 (unit cost $300)
- **THEN** the consumed cost for that ingredient is $300

### Requirement: Inventory access control
The system SHALL restrict inventory management to `owner` and `admin` roles; `cashier` users SHALL NOT adjust stock or change warehouse configuration.

#### Scenario: Cashier cannot adjust stock
- **WHEN** a `cashier` attempts a manual stock adjustment
- **THEN** the system rejects the request with an authorization error

#### Scenario: Cross-tenant stock is blocked
- **WHEN** an `owner` attempts to view or adjust stock belonging to another tenant
- **THEN** the system rejects the request
