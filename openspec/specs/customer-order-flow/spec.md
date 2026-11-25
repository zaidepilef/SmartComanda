# customer-order-flow Specification

## Purpose

Lets a customer order from their phone: scanning the branch QR opens the ordering flow, the customer enters a WhatsApp number (unverified), builds an order from the public menu, and confirms it as a pending order to be paid at the cash register.

## Requirements

### Requirement: Branch QR with tenant and branch
The system SHALL provide a printed QR per branch whose URL is `{PUBLIC_URL}/q/{tenantId}/{branchId}`, and SHALL let `admin` and `owner` users view and print the QR for their own branches from the admin panel.

#### Scenario: Displaying the branch QR
- **WHEN** an `admin` or `owner` opens the QR screen for one of their branches
- **THEN** the panel shows the printable QR URL with the branch's `tenantId` and `branchId`

#### Scenario: QR restricted to own branches
- **WHEN** the user attempts to open the QR screen for a branch of another tenant
- **THEN** the panel rejects the request

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

### Requirement: Customer chooses pickup or delivery
After the customer enters name and phone, the client app SHALL ask whether the order is "Retiro en local" (stored as `orderType` `qr`) or "Domicilio" (stored as `orderType` `delivery`). Orders created without a choice SHALL default to `qr`.

#### Scenario: Pickup keeps the QR flow
- **WHEN** the customer chooses "Retiro en local"
- **THEN** the order is created with `orderType` `qr` exactly as before

#### Scenario: Delivery asks for an address
- **WHEN** the customer chooses "Domicilio"
- **THEN** the app asks for the delivery address before the order can be confirmed

### Requirement: Delivery address with device location
For delivery orders the client app SHALL offer a "Usar mi ubicación" action that reads the device position through the browser Geolocation API after the customer grants permission, shows it on a map with a draggable marker, and pre-fills an editable address. The customer SHALL be able to add a reference (apartment, directions). The public order endpoint SHALL require `delivery.address` when `orderType` is `delivery` and SHALL accept optional `delivery.lat`, `delivery.lng`, and `delivery.accuracy`.

#### Scenario: Location permission granted
- **WHEN** the customer taps "Usar mi ubicación" and allows access
- **THEN** the map shows a marker at the device position and the address field is pre-filled

#### Scenario: Location permission denied
- **WHEN** the customer denies location access
- **THEN** the app explains it and the customer can still type the address and place the order

#### Scenario: Delivery without address is rejected
- **WHEN** a public order with `orderType` `delivery` has no `delivery.address`
- **THEN** the API rejects it with a validation error

### Requirement: Delivery estimate
The system SHALL estimate delivery as the straight-line (Haversine) distance between the branch and the customer multiplied by 1.4, and minutes as that distance divided by the branch `deliveryAvgSpeedKmh`, rounded up. The estimate SHALL be out of range when it exceeds the branch `deliveryMaxKm` or `deliveryMaxMinutes`. Out of range SHALL be a warning only and SHALL NOT block the order. When a delivery order has coordinates and the branch has coordinates, the server SHALL compute the estimate itself and store `deliveryDistanceKm`, `deliveryEtaMinutes`, and `deliveryOutOfRange` on the order.

#### Scenario: Estimate shown before ordering
- **WHEN** the customer fixes the delivery point on the map
- **THEN** the app shows "Llegamos en ~X min (Y km)"

#### Scenario: Out of range warning
- **WHEN** the estimate exceeds the branch limits
- **THEN** the app warns that the address is outside the usual zone and still allows the order

#### Scenario: Branch without coordinates
- **WHEN** the branch has no coordinates
- **THEN** no estimate is shown and the delivery order is created without estimate fields

#### Scenario: Client-sent estimate is ignored
- **WHEN** a public order includes its own distance or minutes values
- **THEN** the stored estimate is the one computed by the server

### Requirement: Staff sees delivery details
POS (kitchen, QR orders, receipt) and the admin order detail SHALL show, for delivery orders, the address, the reference, a "Ver en mapa" link to the coordinates, the estimated distance and minutes, and an "Fuera de rango" badge when applicable.

#### Scenario: Delivery order in the POS
- **WHEN** a cashier opens a delivery order with coordinates
- **THEN** the POS shows the address, "X km · ~Y min", and a link that opens the location in a maps app
