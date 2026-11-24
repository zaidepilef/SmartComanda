## MODIFIED Requirements

### Requirement: Kitchen display
The system SHALL provide a kitchen screen that polls the branch's orders and groups them by status, showing for each order its number, elapsed time, the customer identity (name and phone), the order type, items with quantities and observations, and one-tap buttons to advance the status.

#### Scenario: New orders appear on the kitchen screen
- **WHEN** a paid or pending order is created for the branch and the kitchen screen polls
- **THEN** the order appears in the `new` group with its items, observations, the customer name and phone (when present), and the order type

#### Scenario: Advancing from the kitchen screen
- **WHEN** kitchen staff taps "preparing" on a `new` order
- **THEN** the order moves to the `preparing` group and the screen updates

#### Scenario: Cancelling from the kitchen screen
- **WHEN** kitchen staff taps "cancel" on a `preparing` order
- **THEN** the order moves to the `cancelled` group and disappears from the active queues