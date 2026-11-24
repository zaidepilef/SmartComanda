## MODIFIED Requirements

### Requirement: Checkout access control
The system SHALL allow `cashier`, `owner`, `admin`, and `sysadmin` users to create and charge orders, and SHALL reject these actions for `cook` users with HTTP 403. A `sysadmin` SHALL create orders for any branch; `cashier`, `owner`, and `admin` users SHALL be restricted to branches and dishes of their own tenant.

#### Scenario: Order restricted to own branch
- **WHEN** a `cashier` attempts to create an order for a branch that does not belong to their tenant
- **THEN** the system rejects the order with an error

#### Scenario: Creating an order as sysadmin
- **WHEN** a `sysadmin` creates an order for a branch of any tenant
- **THEN** the order is created and scoped to that branch's tenant

#### Scenario: Cook cannot create or charge
- **WHEN** a `cook` attempts to create an order or charge a pending order
- **THEN** the system responds with HTTP 403 and nothing is created or charged

### Requirement: Order payment requires an open cash session
The system SHALL reject charging an order — either a create with `paymentMethod` or charging a `pending` order — for a branch that has no open cash session. When an order is charged the system SHALL, in a single transaction, mark it `paid`, record the cash session it was charged in and the time of payment, and increase that session's total for the payment method by the order total and its order count by one.

#### Scenario: Rejecting payment without an open session
- **WHEN** an order is charged for a branch without an open cash session
- **THEN** the system rejects the order with an error

#### Scenario: Payment updates the open session
- **WHEN** a paid order of $5000 in cash is created for a branch with an open session
- **THEN** the session's `totals.cash` increases by 5000 and its `orderCount` increases by one

#### Scenario: Order remembers its cash session
- **WHEN** an order is charged
- **THEN** the order stores the id of the open cash session and the payment timestamp

## ADDED Requirements

### Requirement: Charge a pending order
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users to charge a `pending` order of their tenant with one of the branch's payment methods (`cash`, `debit`, `credit`, `transfer`). Charging an order that is not `pending`, or that is `cancelled`, SHALL be rejected with HTTP 409.

#### Scenario: Charging a QR order
- **WHEN** a `cashier` charges a `pending` order of type `qr` with `transfer`
- **THEN** the order becomes `paid` with method `transfer` and the open session's `totals.transfer` increases by the order total

#### Scenario: Charging an already paid order
- **WHEN** a user charges an order that is already `paid`
- **THEN** the system responds with HTTP 409 and the session totals do not change

### Requirement: Cancel an order with a reason
The system SHALL allow only `admin`, `owner`, and `sysadmin` users to cancel an order of their tenant whose status is `new`, `preparing`, or `ready`, and SHALL require a non-empty reason (at most 200 characters). The system SHALL record the reason, the user, and the time of cancellation. If the order was `paid`, the system SHALL, in the same transaction, subtract its total from the payment method total and decrease the order count of the cash session in which it was charged, and SHALL mark the payment as `refunded`. Cancelling a paid order whose cash session is already closed SHALL be rejected with HTTP 409.

#### Scenario: Cancelling a pending order
- **WHEN** an `admin` cancels a `pending` order in status `new` with reason "Cliente se fue"
- **THEN** the order is `cancelled` with the reason, the user, and the timestamp, and no cash totals change

#### Scenario: Cancelling a paid order reverses the cash totals
- **WHEN** an `owner` cancels a $5000 order paid in cash in the branch's still-open session
- **THEN** the order is `cancelled`, its payment is `refunded`, the session's `totals.cash` decreases by 5000, and its `orderCount` decreases by one

#### Scenario: Cancelling without a reason
- **WHEN** an `admin` cancels an order without a reason
- **THEN** the system responds with HTTP 400 and the order keeps its status

#### Scenario: Cancelling a paid order of a closed session
- **WHEN** an `admin` cancels a paid order whose cash session is already closed
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Cashier cannot cancel
- **WHEN** a `cashier` or `cook` attempts to cancel an order
- **THEN** the system responds with HTTP 403 and the order keeps its status

### Requirement: Correct a pending order
The system SHALL allow only `admin`, `owner`, and `sysadmin` users to replace the items (dish and quantity, with optional note) of an order of their tenant whose payment is `pending` and whose status is `new`. The system SHALL re-resolve prices server-side, recompute the total, keep the order number, and record who corrected it and when. Correcting an order that is `paid`, `cancelled`, or no longer `new` SHALL be rejected with HTTP 409. Corrected items SHALL NOT deduct stock.

#### Scenario: Correcting a QR order before charging
- **WHEN** an `admin` changes a `pending` QR order from 2 to 1 "Hotdog Clásico" and adds 1 "Papas Fritas"
- **THEN** the order keeps its number, shows the new items, and its total is recomputed from server prices

#### Scenario: Correcting a paid order
- **WHEN** an `admin` attempts to correct an order that is already `paid`
- **THEN** the system responds with HTTP 409 and the order is unchanged

#### Scenario: Cashier cannot correct
- **WHEN** a `cashier` attempts to correct an order
- **THEN** the system responds with HTTP 403 and the order is unchanged
