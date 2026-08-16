## Purpose

Lets cashiers create orders from configured dishes, choosing per item whether the dish's ingredients are deducted from warehouse stock or the dish is prepared on demand, with clear handling when stock is insufficient.

## ADDED Requirements

### Requirement: Create order with dish items
The system SHALL allow a `cashier` to create an order for their tenant's branch, where each item references a dish, a quantity, and records a snapshot of the dish name and sale price at the time of the order.

#### Scenario: Creating an order with dishes
- **WHEN** a `cashier` creates an order with 2x "Hotdog Clásico" and 1x "Papas Fritas" for their branch
- **THEN** the order is stored with the dish references, snapshots, and quantities

#### Scenario: Order snapshot keeps the sold price
- **WHEN** a dish's sale price changes after an order was created
- **THEN** the stored order item keeps the price from the time the order was placed

#### Scenario: Rejecting an order with a missing dish
- **WHEN** an order item references a dish that does not exist or belongs to another tenant
- **THEN** the system rejects the order with an error

### Requirement: Per-item stock deduction decision
The system SHALL ask the `cashier` per order item whether to deduct the dish's ingredients from warehouse stock (`stockApplied` true or false) and SHALL record the decision on the order item.

#### Scenario: Deducting stock for an item
- **WHEN** a `cashier` marks an item as "deduct stock" and the order is created
- **THEN** each ingredient of the dish is deducted from the corresponding stock pool and a movement is recorded for each deduction

#### Scenario: Skipping deduction for an item
- **WHEN** a `cashier` marks an item as "do not deduct" and the order is created
- **THEN** no stock is deducted and the order item records `stockApplied` as false

#### Scenario: Deduction resolves the correct stock pool
- **WHEN** a stock deduction occurs in `per_branch` mode
- **THEN** the ingredients are deducted from the branch's own stock pool; in `shared` mode they are deducted from the tenant-level pool

### Requirement: Insufficient stock handling
The system SHALL warn the `cashier` when an item is marked as "deduct stock" but the stock pool lacks enough of at least one ingredient, and SHALL let the sale proceed without deducting that item's stock instead of blocking the sale.

#### Scenario: Warning on insufficient stock
- **WHEN** a `cashier` marks an item to deduct stock but the pool has less than the recipe requires
- **THEN** the system shows a warning naming the missing ingredient and suggests switching the item to "do not deduct"

#### Scenario: Sale proceeds without deduction
- **WHEN** the `cashier` confirms the sale with the warning present
- **THEN** the order is created, the item is stored with `stockApplied` as false, and no stock is deducted

### Requirement: Checkout access control
The system SHALL allow `cashier`, `owner`, and `admin` users to create orders, and SHALL restrict order items to dishes of the user's tenant and branch.

#### Scenario: Order restricted to own branch
- **WHEN** a `cashier` attempts to create an order for a branch that does not belong to their tenant
- **THEN** the system rejects the order with an error
