## MODIFIED Requirements

### Requirement: Create order with dish items
The system SHALL allow a `cashier`, `admin`, `owner`, or `sysadmin` to create an order for a branch, where each item references a dish, a quantity, and records a snapshot of the dish name and sale price at the time of the order. Charged orders SHALL record the `paymentMethod` (one of `cash`, `debit`, `credit`, `transfer`), the `paymentStatus` (`paid`), and the `orderType` (one of `takeaway`, `dinein`, `delivery`, `qr`, defaulting to `takeaway`). Orders created without a payment method SHALL be stored as `pending`.

#### Scenario: Creating an order with dishes
- **WHEN** a `cashier` creates an order with 2x "Hotdog Clásico" and 1x "Papas Fritas" for their branch
- **THEN** the order is stored with the dish references, snapshots, and quantities

#### Scenario: Order snapshot keeps the sold price
- **WHEN** a dish's sale price changes after an order was created
- **THEN** the stored order item keeps the price from the time the order was placed

#### Scenario: Rejecting an order with a missing dish
- **WHEN** an order item references a dish that does not exist or belongs to another tenant
- **THEN** the system rejects the order with an error

#### Scenario: Charging an order with a payment method
- **WHEN** a `cashier` creates an order with `paymentMethod` `debit` and `orderType` `dinein`
- **THEN** the order is stored as `paid` with the payment method and the order type

#### Scenario: Creating an order without payment
- **WHEN** a `cashier` creates an order without a `paymentMethod`
- **THEN** the order is stored as `pending`

#### Scenario: Rejecting an unsupported payment method
- **WHEN** an order is charged with a payment method that the branch does not accept
- **THEN** the system rejects the order with an error

### Requirement: Checkout access control
The system SHALL allow `cashier`, `owner`, `admin`, and `sysadmin` users to create orders. A `sysadmin` SHALL create orders for any branch; `cashier`, `owner`, and `admin` users SHALL be restricted to branches and dishes of their own tenant.

#### Scenario: Order restricted to own branch
- **WHEN** a `cashier` attempts to create an order for a branch that does not belong to their tenant
- **THEN** the system rejects the order with an error

#### Scenario: Creating an order as sysadmin
- **WHEN** a `sysadmin` creates an order for a branch of any tenant
- **THEN** the order is created and scoped to that branch's tenant

## ADDED Requirements

### Requirement: Sequential order numbering
The system SHALL assign each order a sequential `number` per branch, starting at 1 and incrementing in creation order, and SHALL enforce uniqueness of the number within the branch.

#### Scenario: First order of a branch
- **WHEN** the first order of a branch is created
- **THEN** its `number` is 1

#### Scenario: Consecutive numbers in creation order
- **WHEN** several orders are created in a branch
- **THEN** each order receives the next consecutive number

#### Scenario: Numbers are per branch
- **WHEN** orders are created in two different branches
- **THEN** both branches may have an order with the same `number`, each unique within its branch

### Requirement: Order payment requires an open cash session
The system SHALL reject charging an order (a create with `paymentMethod`) for a branch that has no open cash session, and SHALL update the branch's open session when a paid order is created: the session's total for the payment method and its order count SHALL increase by the order total and one, respectively.

#### Scenario: Rejecting payment without an open session
- **WHEN** an order is charged for a branch without an open cash session
- **THEN** the system rejects the order with an error

#### Scenario: Payment updates the open session
- **WHEN** a paid order of $5000 in cash is created for a branch with an open session
- **THEN** the session's `totals.cash` increases by 5000 and its `orderCount` increases by one