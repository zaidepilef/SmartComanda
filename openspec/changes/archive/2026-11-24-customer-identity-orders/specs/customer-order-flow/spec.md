## MODIFIED Requirements

### Requirement: Customer ordering flow
The system SHALL provide a mobile web app `frontend-client` reachable at `/q/:tenantId/:branchId` that first asks the customer for their name and a WhatsApp phone number, then shows the public menu of that branch with a cart, lets the customer place an order, and shows a confirmation with the order number, the total, and the instruction to pay at the cash register.

#### Scenario: Opening the flow from the QR
- **WHEN** a customer opens `/q/:tenantId/:branchId` for an active branch
- **THEN** the app prompts for name and phone number before showing the menu, and the menu shows only dishes of that branch with their prices

#### Scenario: Phone is remembered per branch
- **WHEN** a customer who already entered their name and phone returns to the same branch
- **THEN** the name and phone are pre-filled and the menu is shown without re-entering them

#### Scenario: Placing the order
- **WHEN** the customer confirms a cart with one or more items
- **THEN** the order is created with `orderType` `qr`, `paymentStatus` `pending`, `clientName` and `clientPhone` set to the entered name and phone, and the confirmation screen shows the order number, total, and "paga en caja"

#### Scenario: Confirming an empty cart is blocked
- **WHEN** the cart has no items
- **THEN** the confirm action is disabled

### Requirement: Public order creation
The system SHALL provide a public endpoint `POST /api/public/orders` taking `tenantId`, `branchId`, `name`, `phone`, and items (`dishId`, `quantity`), that validates the branch and dishes exactly like authenticated order creation — including resolving prices server-side from the dish's branch override or default `salePrice`, assigning the sequential order `number` — SHALL store each item with `stockApplied` `false`, and SHALL store the customer identity (`clientName` and `clientPhone`) on the order and on the customer record.

#### Scenario: Prices are computed server-side
- **WHEN** a customer sends items with quantities
- **THEN** the order total is computed from the server-resolved dish prices, ignoring any client-sent price

#### Scenario: Customer identity is stored on the order and customer
- **WHEN** a QR order is created with a name and phone
- **THEN** the order stores `clientName` and `clientPhone`, and the customer record for that phone keeps the provided name

#### Scenario: Rejecting a dish of another tenant
- **WHEN** an order item references a dish that does not belong to the branch's tenant or does not exist
- **THEN** the endpoint rejects the order with an error

#### Scenario: QR orders do not deduct stock
- **WHEN** an order is created through the public endpoint
- **THEN** every item is stored with `stockApplied` `false` and no stock is deducted

#### Scenario: Sequential numbering applies
- **WHEN** two customers place public orders for the same branch concurrently
- **THEN** each order receives a distinct sequential `number` from the branch counter

### Requirement: POS shows the QR customer
The POS SHALL display the `clientName` and `clientPhone` of an order whose `orderType` is `qr` so the cash register can match the customer at payment time.

#### Scenario: Phone shown for QR orders
- **WHEN** a cashier opens a pending order of type `qr` created by the customer
- **THEN** the POS shows the customer's name and phone