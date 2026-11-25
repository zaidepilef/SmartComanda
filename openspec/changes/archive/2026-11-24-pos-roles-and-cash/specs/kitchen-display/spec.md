## MODIFIED Requirements

### Requirement: Order status lifecycle
The system SHALL track each order through the statuses `new`, `preparing`, `ready`, `delivered`, and `cancelled`, with allowed transitions: `new → preparing`, `preparing → ready`, `ready → delivered`, and `cancelled` reachable from `new`, `preparing`, or `ready`. Orders are created as `new`. Advancing the status SHALL be allowed to `cook`, `cashier`, `admin`, `owner`, and `sysadmin`; cancelling SHALL follow the "Cancel an order with a reason" requirement and be allowed only to `admin`, `owner`, and `sysadmin`. A `pending` order of type `qr` SHALL NOT advance past `new` until it is charged.

#### Scenario: Advancing an order
- **WHEN** a `cook` advances a `new` order to `preparing` and then to `ready`
- **THEN** the order reflects each status change with an updated timestamp

#### Scenario: Delivering a ready order
- **WHEN** a `cook` or `cashier` advances a `ready` order to `delivered`
- **THEN** the order is recorded as `delivered`

#### Scenario: Cancelling an order
- **WHEN** an `admin` cancels a `new`, `preparing`, or `ready` order with a reason
- **THEN** the order is recorded as `cancelled`

#### Scenario: Rejecting an invalid transition
- **WHEN** a user attempts to advance a `new` order directly to `delivered` or to cancel a `delivered` order
- **THEN** the system responds with HTTP 409 and the order keeps its status

#### Scenario: Unpaid QR order cannot start preparation
- **WHEN** a user advances a `pending` order of type `qr` from `new` to `preparing`
- **THEN** the system responds with HTTP 409 and the order keeps its status

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
The system SHALL provide a kitchen screen that polls the branch's orders and groups them by status, showing for each order its number, elapsed time, items with quantities and observations, and one-tap buttons to advance the status. The kitchen screen SHALL NOT show `pending` orders of type `qr`, and SHALL show the cancel action only to `admin`, `owner`, and `sysadmin` users.

#### Scenario: New orders appear on the kitchen screen
- **WHEN** an order is created at the POS, or a QR order is charged, and the kitchen screen polls
- **THEN** the order appears in the `new` group with its items and observations

#### Scenario: Unpaid QR orders are hidden from the kitchen
- **WHEN** a customer places a QR order that has not been charged
- **THEN** the order does not appear on the kitchen screen

#### Scenario: Advancing from the kitchen screen
- **WHEN** kitchen staff taps "preparing" on a `new` order
- **THEN** the order moves to the `preparing` group and the screen updates

#### Scenario: Cancelling from the kitchen screen
- **WHEN** an `admin` taps "cancel" on a `preparing` order and enters a reason
- **THEN** the order moves to the `cancelled` group and disappears from the active queues

#### Scenario: Cook sees no cancel action
- **WHEN** a `cook` views the kitchen screen
- **THEN** no cancel button is shown
