## MODIFIED Requirements

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

## ADDED Requirements

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
