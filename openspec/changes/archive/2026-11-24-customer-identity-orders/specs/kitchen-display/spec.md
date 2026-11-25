## MODIFIED Requirements

### Requirement: Kitchen display
The system SHALL provide a kitchen screen that polls the branch's orders and groups them by status, showing for each order its number, elapsed time, the customer identity (name and phone), the order type, items with quantities and observations, and one-tap buttons to advance the status. The kitchen screen SHALL NOT show `pending` orders of type `qr`, and SHALL show the cancel action only to `admin`, `owner`, and `sysadmin` users.

#### Scenario: New orders appear on the kitchen screen
- **WHEN** an order is created at the POS, or a QR order is charged, and the kitchen screen polls
- **THEN** the order appears in the `new` group with its items, observations, the customer name and phone (when present), and the order type

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
