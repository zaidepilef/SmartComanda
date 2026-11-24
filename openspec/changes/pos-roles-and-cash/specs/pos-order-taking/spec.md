## ADDED Requirements

### Requirement: Pending QR orders queue
The POS SHALL show `cashier`, `admin`, `owner`, and `sysadmin` users a queue of the branch's `pending` orders of type `qr`, refreshed periodically, with each order's number, customer name and phone, items, total, and age. From the queue the user SHALL be able to charge the order with the branch's payment methods using the same payment flow as a new order; `admin`, `owner`, and `sysadmin` SHALL also be able to correct or cancel it.

#### Scenario: QR order appears in the queue
- **WHEN** a customer places a QR order for the branch
- **THEN** the order appears in the POS queue with the customer's name, phone, items, and total

#### Scenario: Charging from the queue
- **WHEN** a `cashier` charges a queued QR order in cash
- **THEN** the order leaves the queue, becomes `paid`, and appears on the kitchen screen

#### Scenario: Cashier sees no cancel or correct action
- **WHEN** a `cashier` opens a queued QR order
- **THEN** only the charge action is offered

#### Scenario: Charging from the queue without an open session
- **WHEN** a user charges a queued order and the branch has no open cash session
- **THEN** the POS blocks the payment and shows the prompt to open the cash session

### Requirement: Clear permission messages
The POS SHALL hide actions the signed-in role cannot perform and, when the API still responds with HTTP 403, SHALL show a message explaining that the user's role does not allow the action.

#### Scenario: Forbidden action response
- **WHEN** the API rejects an action with HTTP 403
- **THEN** the POS shows "Tu rol no permite esta acción" and keeps the current screen
