## MODIFIED Requirements

### Requirement: Collect payment on delivery
The system SHALL provide `POST /api/orders/:id/deliver` taking `paymentMethod` (`cash`, `debit`, or `credit`, enabled on the branch) and, for cash, `cashReceived`. Only the assigned driver or `admin`, `owner`, `sysadmin` SHALL call it, and only for an `out_for_delivery` order whose payment status is `pending`, `declined` or `paid`. For a `pending` or `declined` order, `paymentMethod` SHALL be required, and in a single transaction the system SHALL mark the order `paid` with the method, `paidBy` set to the user, and the branch's open cash session, add the amount to that session's totals, append the payment to the payment history, and move the order to `delivered`. Cash SHALL be rejected when `cashReceived` is below the total, and the response SHALL include the change. For an order already `paid` (for example, charged at the register before collection on delivery existed), the system SHALL only move it to `delivered`: it SHALL NOT require an open cash session, SHALL NOT change payment data or session totals, SHALL ignore `paymentMethod`, and SHALL respond with change 0. An order whose payment is `voided` or `refunded` SHALL be rejected with HTTP 409. Loyalty points SHALL be awarded as for a charge at the register, at most once per order.

#### Scenario: Cash on delivery
- **WHEN** the driver delivers a $7.500 order and records cash with `cashReceived` 10000
- **THEN** the order is `paid` with method `cash` and `delivered`, the session's `totals.cash` increases by 7500, and the response shows change 2500

#### Scenario: Card on delivery
- **WHEN** the driver records a `debit` payment approved on their POS terminal
- **THEN** the order is `paid` with method `debit`, `delivered`, and `paidBy` is the driver

#### Scenario: Insufficient cash
- **WHEN** `cashReceived` is below the order total
- **THEN** the request is rejected and the order stays `out_for_delivery` and `pending`

#### Scenario: No open cash session
- **WHEN** the branch has no open cash session and the order is not yet paid
- **THEN** the API responds with HTTP 409, nothing changes, and the POS tells the driver to ask the Encargado to open it

#### Scenario: Order already paid before dispatch
- **WHEN** the driver delivers an `out_for_delivery` order that is already `paid`, with no payment method and no open cash session
- **THEN** the order becomes `delivered`, its payment method, `paidBy` and cash session stay as they were, no session totals change, and the response shows change 0

#### Scenario: Missing payment method
- **WHEN** the deliver request has no `paymentMethod` and the order is `pending` or `declined`
- **THEN** the API responds with HTTP 400 and the order stays `out_for_delivery`

#### Scenario: Voided order
- **WHEN** the deliver request is sent for an `out_for_delivery` order whose payment is `voided`
- **THEN** the API responds with HTTP 409 and nothing changes

#### Scenario: Paying twice
- **WHEN** the deliver request is sent again for an order already `delivered` and `paid`
- **THEN** the API responds with HTTP 409 and the session totals do not change

#### Scenario: Another driver's order
- **WHEN** a `driver` tries to deliver an order assigned to a different driver
- **THEN** the API responds with HTTP 403
