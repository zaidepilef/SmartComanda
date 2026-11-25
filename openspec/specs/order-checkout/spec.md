# order-checkout Specification

## Purpose

Lets cashiers create orders from configured dishes, choosing per item whether the dish's ingredients are deducted from warehouse stock or the dish is prepared on demand, with clear handling when stock is insufficient.

## Requirements

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
The system SHALL reject charging an order — either a create with `paymentMethod` or charging a `pending` order — for a branch that has no open cash session. When an order is charged the system SHALL, in a single transaction, mark it `paid`, record the cash session it was charged in, the time of payment, and the user who charged it, and increase that session's total for the payment method by the order total and its order count by one.

#### Scenario: Rejecting payment without an open session
- **WHEN** an order is charged for a branch without an open cash session
- **THEN** the system rejects the order with an error

#### Scenario: Payment updates the open session
- **WHEN** a paid order of $5000 in cash is created for a branch with an open session
- **THEN** the session's `totals.cash` increases by 5000 and its `orderCount` increases by one

#### Scenario: Order remembers its cash session
- **WHEN** an order is charged
- **THEN** the order stores the id of the open cash session and the payment timestamp

#### Scenario: Order records who charged it
- **WHEN** a `cashier` charges an order
- **THEN** the order stores that user as the payer, and reading or listing the order returns the payer's name

### Requirement: Charge a pending order
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users to charge at the register an order of their tenant whose payment status is `pending` or `declined`, with one of the branch's payment methods (`cash`, `debit`, `credit`, `transfer`). Charging an order that is `paid`, `voided`, or `refunded`, or whose status is `cancelled`, SHALL be rejected with HTTP 409. Selecting an expected payment method in the client app SHALL NOT count as a charge. App delivery orders SHALL be collected through the delivery-dispatch "Collect payment on delivery" requirement.

#### Scenario: Charging a QR order
- **WHEN** a `cashier` charges a `pending` order of type `qr` with `transfer`
- **THEN** the order becomes `paid` with method `transfer` and the open session's `totals.transfer` increases by the order total

#### Scenario: Charging an already paid order
- **WHEN** a user charges an order that is already `paid`
- **THEN** the system responds with HTTP 409 and the session totals do not change

#### Scenario: Expected method is shown to the cashier
- **WHEN** a `cashier` opens a pending QR order whose customer chose Débito
- **THEN** the POS pre-selects Débito and the cashier can still charge with another enabled method

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
The system SHALL allow only `admin`, `owner`, and `sysadmin` users to replace the items (dish and quantity) of an order of their tenant whose payment is `pending` and whose status is `new`. The system SHALL re-resolve prices server-side, recompute the total, keep the order number, and record who corrected it and when. Correcting an order that is `paid`, `cancelled`, or no longer `new` SHALL be rejected with HTTP 409. Corrected items SHALL NOT deduct stock.

#### Scenario: Correcting a QR order before charging
- **WHEN** an `admin` changes a `pending` QR order from 2 to 1 "Hotdog Clásico" and adds 1 "Papas Fritas"
- **THEN** the order keeps its number, shows the new items, and its total is recomputed from server prices

#### Scenario: Correcting a paid order
- **WHEN** an `admin` attempts to correct an order that is already `paid`
- **THEN** the system responds with HTTP 409 and the order is unchanged

#### Scenario: Cashier cannot correct
- **WHEN** a `cashier` attempts to correct an order
- **THEN** the system responds with HTTP 403 and the order is unchanged

### Requirement: Payment status lifecycle
The system SHALL track the payment of each order separately from its operational status with the values `pending`, `paid`, `declined`, `voided`, and `refunded`, allowing only `pending → paid | declined | voided`, `declined → paid | voided`, and `paid → refunded` (reserved; no endpoint in this version). An order SHALL become `paid` only when a cashier charges it at the register or a driver records an approved payment on delivery. Cancelling or rejecting an order that is not paid SHALL set its payment status to `voided`.

#### Scenario: Preparation does not mark as paid
- **WHEN** an app delivery order goes through `preparing`, `ready`, and `out_for_delivery`
- **THEN** its payment status stays `pending`

#### Scenario: Cancelling an unpaid order
- **WHEN** an `admin` cancels a `pending` QR order with a reason
- **THEN** the order is `cancelled` and its payment status is `voided`

#### Scenario: Invalid payment transition
- **WHEN** any path tries to move a `voided` order to `paid`
- **THEN** the system responds with HTTP 409

### Requirement: Payment history
The system SHALL append an entry to the order's `paymentHistory` on every payment status change, with the new status, the method when known, the user (or `customer` for creation), the timestamp, and an optional note, and SHALL return the history in the order detail.

#### Scenario: History of a delivery order
- **WHEN** a delivery order is created, a card is declined at the door, and the driver collects cash
- **THEN** the order detail shows `pending`, `declined`, and `paid` with method `cash` and the driver as user

### Requirement: Reject an app order with a reason
The system SHALL provide `POST /api/orders/:id/reject` taking a required `reason` (3 to 200 characters) that lets `cashier`, `admin`, `owner`, and `sysadmin` users of the order's branch reject an order created from the client app (pickup `qr` or app delivery) while it is `new` and not `paid`. Rejecting SHALL set the status to `rejected`, store the reason, the user, and the time, append the change to the status history, set the payment status to `voided`, and make the reason visible to the customer in order tracking. Rejecting an order that is not `new`, is `paid`, or was not created from the client app SHALL respond with HTTP 409; `cook` and `driver` SHALL receive HTTP 403.

#### Scenario: Cashier rejects a pickup order
- **WHEN** a `cashier` rejects a `new` pending QR order with the reason "Cerramos en 10 minutos"
- **THEN** the order is `rejected` with that reason, its payment is `voided`, and it leaves the "Por cobrar" queue

#### Scenario: Rejecting without a reason
- **WHEN** a user rejects an order with an empty reason
- **THEN** the API rejects the request with a validation error and the order keeps its status

#### Scenario: Order already in preparation
- **WHEN** a user tries to reject an order that is `preparing`
- **THEN** the API responds with HTTP 409; only an `admin` or higher can cancel it instead

#### Scenario: Cook cannot reject
- **WHEN** a `cook` tries to reject an order
- **THEN** the API responds with HTTP 403
