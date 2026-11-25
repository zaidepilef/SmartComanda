# delivery-dispatch Specification

## Purpose
Gestiona el reparto de los domicilios pedidos desde la app: salida a reparto, asignación de repartidor, cobro contra entrega con vuelto y registro de tarjetas rechazadas.

## Requirements

### Requirement: Dispatch board
The POS SHALL provide a "Reparto" screen for `driver`, `cashier`, `admin`, `owner`, and `sysadmin` users that polls the branch's app delivery orders in `ready` or `out_for_delivery` and shows, for each one: number, customer name, phone as a call link, address, reference, a "Ver en mapa" link, items, total to collect, expected payment method, the cash amount the customer will pay with, and the change to bring. A `driver` SHALL only see the orders of their own branch, and SHALL see an `out_for_delivery` order only when it is assigned to them.

#### Scenario: Ready delivery order on the board
- **WHEN** a cook marks an app delivery order as `ready`
- **THEN** it appears on the dispatch board under "Listos para despacho" with the total to collect

#### Scenario: Change to bring
- **WHEN** the order total is $7.500, the expected method is `cash`, and the customer will pay with $10.000
- **THEN** the board shows "Paga con $10.000 · vuelto $2.500"

#### Scenario: Driver sees only their deliveries in route
- **WHEN** two drivers each take one order
- **THEN** each driver sees in "En reparto" only the order they took

### Requirement: Taking an order out for delivery
The system SHALL let a `driver` take a `ready` app delivery order of their branch, which SHALL move it to `out_for_delivery`, store the driver as `driverId`, and record the change in the status history. `admin`, `owner`, and `sysadmin` SHALL be able to assign or reassign the driver of a `ready` or `out_for_delivery` order. Before taking an order, the POS SHALL warn when the branch has no open cash session.

#### Scenario: Driver takes an order
- **WHEN** a `driver` taps "Salir a reparto" on a `ready` delivery order
- **THEN** the order becomes `out_for_delivery` with that driver assigned

#### Scenario: Taking an order already taken
- **WHEN** two drivers take the same order at the same time
- **THEN** only the first succeeds and the second receives HTTP 409

#### Scenario: Manager reassigns
- **WHEN** an `admin` reassigns an `out_for_delivery` order to another driver of the branch
- **THEN** the order's `driverId` changes and the change is recorded in the history

### Requirement: Collect payment on delivery
The system SHALL provide `POST /api/orders/:id/deliver` taking `paymentMethod` (`cash`, `debit`, or `credit`, enabled on the branch) and, for cash, `cashReceived`. Only the assigned driver or `admin`, `owner`, `sysadmin` SHALL call it, and only for an `out_for_delivery` order whose payment status is `pending` or `declined`. In a single transaction it SHALL mark the order `paid` with the method, `paidBy` set to the user, and the branch's open cash session, add the amount to that session's totals, append the payment to the payment history, and move the order to `delivered`. Cash SHALL be rejected when `cashReceived` is below the total, and the response SHALL include the change. Loyalty points SHALL be awarded as for a charge at the register.

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
- **WHEN** the branch has no open cash session
- **THEN** the API responds with HTTP 409, nothing changes, and the POS tells the driver to ask the Encargado to open it

#### Scenario: Paying twice
- **WHEN** the deliver request is sent again for an order already `delivered` and `paid`
- **THEN** the API responds with HTTP 409 and the session totals do not change

#### Scenario: Another driver's order
- **WHEN** a `driver` tries to deliver an order assigned to a different driver
- **THEN** the API responds with HTTP 403

### Requirement: Declined card payment on delivery
The system SHALL provide `POST /api/orders/:id/payment-declined` with an optional note, allowed to the assigned driver and to `admin`, `owner`, `sysadmin`, that sets the payment status of an `out_for_delivery` order to `declined` and records it in the payment history without changing the order status. A `declined` order SHALL still be collectable with any enabled method.

#### Scenario: Card declined, then paid in cash
- **WHEN** the driver records a declined card and then delivers the order with cash
- **THEN** the payment history shows `declined` and then `paid` with method `cash`
