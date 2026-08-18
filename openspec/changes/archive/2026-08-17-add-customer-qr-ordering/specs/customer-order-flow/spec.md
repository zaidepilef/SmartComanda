## Purpose

Lets a customer order from their phone: scanning the branch QR opens the ordering flow, the customer enters a WhatsApp number (unverified), builds an order from the public menu, and confirms it as a pending order to be paid at the cash register.

## ADDED Requirements

### Requirement: Branch QR with tenant and branch
The system SHALL provide a printed QR per branch whose URL is `{PUBLIC_URL}/q/{tenantId}/{branchId}`, and SHALL let `admin` and `owner` users view and print the QR for their own branches from the admin panel.

#### Scenario: Displaying the branch QR
- **WHEN** an `admin` or `owner` opens the QR screen for one of their branches
- **THEN** the panel shows the printable QR URL with the branch's `tenantId` and `branchId`

#### Scenario: QR restricted to own branches
- **WHEN** the user attempts to open the QR screen for a branch of another tenant
- **THEN** the panel rejects the request

### Requirement: Customer ordering flow
The system SHALL provide a mobile web app `frontend-client` reachable at `/q/:tenantId/:branchId` that first asks the customer for a WhatsApp phone number, then shows the public menu of that branch with a cart, lets the customer place an order, and shows a confirmation with the order number, the total, and the instruction to pay at the cash register.

#### Scenario: Opening the flow from the QR
- **WHEN** a customer opens `/q/:tenantId/:branchId` for an active branch
- **THEN** the app prompts for the phone number before showing the menu, and the menu shows only dishes of that branch with their prices

#### Scenario: Phone is remembered per branch
- **WHEN** a customer who already entered their phone returns to the same branch
- **THEN** the phone is pre-filled and the menu is shown without re-entering it

#### Scenario: Placing the order
- **WHEN** the customer confirms a cart with one or more items
- **THEN** the order is created with `orderType` `qr`, `paymentStatus` `pending`, `clientPhone` set to the entered phone, and the confirmation screen shows the order number, total, and "paga en caja"

#### Scenario: Confirming an empty cart is blocked
- **WHEN** the cart has no items
- **THEN** the confirm action is disabled

### Requirement: Public order creation
The system SHALL provide a public endpoint `POST /api/public/orders` taking `tenantId`, `branchId`, `phone`, and items (`dishId`, `quantity`), that validates the branch and dishes exactly like authenticated order creation — including resolving prices server-side from the dish's branch override or default `salePrice`, assigning the sequential order `number` — and SHALL store each item with `stockApplied` `false`.

#### Scenario: Prices are computed server-side
- **WHEN** a customer sends items with quantities
- **THEN** the order total is computed from the server-resolved dish prices, ignoring any client-sent price

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
The POS SHALL display the `clientPhone` of an order whose `orderType` is `qr` so the cash register can match the customer at payment time.

#### Scenario: Phone shown for QR orders
- **WHEN** a cashier opens a pending order of type `qr` created by the customer
- **THEN** the POS shows the customer's phone