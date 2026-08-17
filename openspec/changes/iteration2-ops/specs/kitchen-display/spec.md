## Purpose

Defines the kitchen order lifecycle and the kitchen display screen (KDS) that prepares it: orders advance through `new → preparing → ready → delivered` and can be cancelled, keeping kitchen and point of sale synchronized.

## ADDED Requirements

### Requirement: Order status lifecycle
The system SHALL track each order through the statuses `new`, `preparing`, `ready`, `delivered`, and `cancelled`, with allowed transitions: `new → preparing`, `preparing → ready`, `ready → delivered`, and `cancelled` reachable from `new` or `preparing`. Orders are created as `new`.

#### Scenario: Advancing an order
- **WHEN** a `cashier` advances a `new` order to `preparing` and then to `ready`
- **THEN** the order reflects each status change with an updated timestamp

#### Scenario: Delivering a ready order
- **WHEN** a `cashier` advances a `ready` order to `delivered`
- **THEN** the order is recorded as `delivered`

#### Scenario: Cancelling an order
- **WHEN** a `cashier` cancels a `new` or `preparing` order
- **THEN** the order is recorded as `cancelled`

#### Scenario: Rejecting an invalid transition
- **WHEN** a `cashier` attempts to advance a `new` order directly to `delivered` or to cancel a `delivered` order
- **THEN** the system responds with HTTP 409 and the order keeps its status

### Requirement: Kitchen status update access control
The system SHALL restrict status updates to users of the order's tenant and branch, and SHALL reject updates to orders outside the user's scope with HTTP 404.

#### Scenario: Updating own branch's order
- **WHEN** a `cashier` updates the status of an order from their own branch
- **THEN** the system applies the update

#### Scenario: Updating an out-of-scope order
- **WHEN** a `cashier` attempts to update an order of another branch or tenant
- **THEN** the system responds with HTTP 404

### Requirement: Kitchen display
The system SHALL provide a kitchen screen that polls the branch's orders and groups them by status, showing for each order its number, elapsed time, items with quantities and observations, and one-tap buttons to advance the status.

#### Scenario: New orders appear on the kitchen screen
- **WHEN** a paid or pending order is created for the branch and the kitchen screen polls
- **THEN** the order appears in the `new` group with its items and observations

#### Scenario: Advancing from the kitchen screen
- **WHEN** kitchen staff taps "preparing" on a `new` order
- **THEN** the order moves to the `preparing` group and the screen updates

#### Scenario: Cancelling from the kitchen screen
- **WHEN** kitchen staff taps "cancel" on a `preparing` order
- **THEN** the order moves to the `cancelled` group and disappears from the active queues
