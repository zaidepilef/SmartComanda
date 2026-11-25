## MODIFIED Requirements

### Requirement: Charge a pending order
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users to charge at the register an order of their tenant whose payment status is `pending` or `rejected`, with one of the branch's payment methods (`cash`, `debit`, `credit`, `transfer`). Charging an order that is `paid`, `voided`, or `refunded`, or whose status is `cancelled`, SHALL be rejected with HTTP 409. Selecting an expected payment method in the client app SHALL NOT count as a charge. App delivery orders SHALL be collected through the delivery-dispatch "Collect payment on delivery" requirement.

#### Scenario: Charging a QR order
- **WHEN** a `cashier` charges a `pending` order of type `qr` with `transfer`
- **THEN** the order becomes `paid` with method `transfer` and the open session's `totals.transfer` increases by the order total

#### Scenario: Charging an already paid order
- **WHEN** a user charges an order that is already `paid`
- **THEN** the system responds with HTTP 409 and the session totals do not change

#### Scenario: Expected method is shown to the cashier
- **WHEN** a `cashier` opens a pending QR order whose customer chose Débito
- **THEN** the POS pre-selects Débito and the cashier can still charge with another enabled method

## ADDED Requirements

### Requirement: Payment status lifecycle
The system SHALL track the payment of each order separately from its operational status with the values `pending`, `paid`, `rejected`, `voided`, and `refunded`, allowing only `pending → paid | rejected | voided`, `rejected → paid | voided`, and `paid → refunded` (reserved; no endpoint in this version). An order SHALL become `paid` only when a cashier charges it at the register or a driver records an approved payment on delivery. Cancelling an order that is not paid SHALL set its payment status to `voided`.

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
- **THEN** the order detail shows `pending`, `rejected`, and `paid` with method `cash` and the driver as user
