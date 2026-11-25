# kitchen-display Specification

## Purpose

Defines the kitchen order lifecycle and the kitchen display screen (KDS) that prepares it: orders advance through `new → preparing → ready → delivered` and can be cancelled, keeping kitchen and point of sale synchronized.

## Requirements

### Requirement: Order status lifecycle
The system SHALL track each order through the statuses `new`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `rejected`, and `cancelled`. Allowed transitions SHALL be `new → preparing`, `preparing → ready`, `ready → delivered` for orders that are not app delivery orders, `ready → out_for_delivery → delivered` for app delivery orders (`orderType` `delivery` with an address), `new → rejected` for orders created from the client app (following the order-checkout "Reject an app order with a reason" requirement), and `cancelled` reachable from `new`, `preparing`, `ready`, or `out_for_delivery`. `rejected`, `delivered`, and `cancelled` are final. Orders are created as `new`. Advancing to `preparing` and `ready` SHALL be allowed to `cook`, `cashier`, `admin`, `owner`, and `sysadmin`; `ready → delivered` to `cook`, `cashier`, `admin`, `owner`, and `sysadmin`; the transitions into and out of `out_for_delivery` SHALL follow the delivery-dispatch requirements; cancelling SHALL follow the "Cancel an order with a reason" requirement and be allowed only to `admin`, `owner`, and `sysadmin`. A `pending` order of type `qr` SHALL NOT advance past `new` until it is charged. An app delivery order SHALL advance to `preparing` while its payment is still `pending`.

#### Scenario: Advancing an order
- **WHEN** a `cook` advances a `new` order to `preparing` and then to `ready`
- **THEN** the order reflects each status change with an updated timestamp

#### Scenario: Delivering a ready order
- **WHEN** a `cook` or `cashier` advances a `ready` order of type `qr` to `delivered`
- **THEN** the order is recorded as `delivered`

#### Scenario: App delivery order skips out for delivery
- **WHEN** a user advances a `ready` app delivery order directly to `delivered` through the status endpoint
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Cancelling an order
- **WHEN** an `admin` cancels a `new`, `preparing`, `ready`, or `out_for_delivery` order with a reason
- **THEN** the order is recorded as `cancelled`

#### Scenario: Rejecting an invalid transition
- **WHEN** a user attempts to advance a `new` order directly to `delivered` or to cancel a `delivered` order
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Rejected order is final
- **WHEN** a user tries to advance a `rejected` order to `preparing`
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Unpaid QR order cannot start preparation
- **WHEN** a user advances a `pending` order of type `qr` from `new` to `preparing`
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Unpaid delivery order starts preparation
- **WHEN** a `cook` advances a `pending` app delivery order from `new` to `preparing`
- **THEN** the change is applied and the payment stays `pending`

### Requirement: Kitchen status update access control
The system SHALL restrict status updates to users of the order's tenant and branch, SHALL reject updates to orders outside the user's scope with HTTP 404, and SHALL reject cancellation through the status endpoint for `cook` and `cashier` users with HTTP 403.

#### Scenario: Updating own branch's order
- **WHEN** a `cook` updates the status of an order from their own branch
- **THEN** the system applies the update

#### Scenario: Updating an out-of-scope order
- **WHEN** a `cashier` attempts to update an order of another branch or tenant
- **THEN** the system responds with HTTP 404

#### Scenario: Cook cannot cancel
- **WHEN** a `cook` sets an order's status to `cancelled`
- **THEN** the system responds with HTTP 403 and the order keeps its status

### Requirement: Kitchen display
The system SHALL provide a kitchen screen that polls the branch's orders and groups them by status, showing for each order its number, elapsed time, the customer identity (name and phone), the order type and mode (Retiro / Domicilio), items with quantities and notes, and one-tap buttons to advance the status. The kitchen screen SHALL NOT show `pending` orders of type `qr`, SHALL show app delivery orders as soon as they are created with a "Paga al recibir" badge, SHALL hide orders once they reach `out_for_delivery` or `rejected`, SHALL show a "Rechazar" action with a required reason on app delivery orders in `new` to `cashier`, `admin`, `owner`, and `sysadmin`, and SHALL show the cancel action only to `admin`, `owner`, and `sysadmin` users. Status labels SHALL depend on the mode: "Listo para retirar" for pickup and "Listo para despacho" for delivery.

#### Scenario: New orders appear on the kitchen screen
- **WHEN** an order is created at the POS, a QR order is charged, or a customer confirms a delivery order, and the kitchen screen polls
- **THEN** the order appears in the `new` group with its items, notes, the customer name and phone (when present), and the order type

#### Scenario: Unpaid QR orders are hidden from the kitchen
- **WHEN** a customer places a QR order that has not been charged
- **THEN** the order does not appear on the kitchen screen

#### Scenario: Delivery order with pending payment
- **WHEN** a customer confirms a delivery order
- **THEN** the kitchen shows it in `new` with the badge "Paga al recibir"

#### Scenario: Rejecting a delivery order from the kitchen screen
- **WHEN** a `cashier` taps "Rechazar" on a `new` delivery order and enters a reason
- **THEN** the order becomes `rejected` and disappears from the kitchen screen

#### Scenario: Advancing from the kitchen screen
- **WHEN** kitchen staff taps "preparing" on a `new` order
- **THEN** the order moves to the `preparing` group and the screen updates

#### Scenario: Cancelling from the kitchen screen
- **WHEN** an `admin` taps "cancel" on a `preparing` order and enters a reason
- **THEN** the order moves to the `cancelled` group and disappears from the active queues

#### Scenario: Cook sees no cancel action
- **WHEN** a `cook` views the kitchen screen
- **THEN** no cancel button is shown
