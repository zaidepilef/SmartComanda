## MODIFIED Requirements

### Requirement: Pending QR orders queue
The POS SHALL show `cashier`, `admin`, `owner`, and `sysadmin` users a queue of the branch's `pending` orders of type `qr` in status `new`, refreshed periodically, with each order's number, customer name and phone, items with notes, total, expected payment method, and age. From the queue the user SHALL be able to charge the order with the branch's payment methods using the same payment flow as a new order, or reject it with a required reason; `admin`, `owner`, and `sysadmin` SHALL also be able to correct or cancel it.

#### Scenario: QR order appears in the queue
- **WHEN** a customer places a QR order for the branch
- **THEN** the order appears in the POS queue with the customer's name, phone, items, total, and expected payment method

#### Scenario: Charging from the queue
- **WHEN** a `cashier` charges a queued QR order in cash
- **THEN** the order leaves the queue, becomes `paid`, and appears on the kitchen screen

#### Scenario: Cashier sees no cancel or correct action
- **WHEN** a `cashier` opens a queued QR order
- **THEN** only the charge and reject actions are offered

#### Scenario: Rejecting from the queue
- **WHEN** a `cashier` rejects a queued QR order and enters a reason
- **THEN** the order leaves the queue as `rejected` and the customer sees the reason in order tracking

#### Scenario: Charging from the queue without an open session
- **WHEN** a user charges a queued order and the branch has no open cash session
- **THEN** the POS blocks the payment and shows the prompt to open the cash session
