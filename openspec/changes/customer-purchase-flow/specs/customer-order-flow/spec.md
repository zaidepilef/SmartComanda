## MODIFIED Requirements

### Requirement: Customer ordering flow
The system SHALL provide a mobile web app `frontend-client` reachable at `/q/:tenantId/:branchId` that guides the customer through these steps in order: (1) delivery mode ("Retiro en local" or "Domicilio"), (2) phone, (3) welcome for a known customer or name for a new one, (4) delivery address when the mode is delivery, (5) the branch menu with a cart, (6) an order summary with the expected payment method, and (7) a confirmation. The app SHALL let the customer go back to a previous step without losing the cart, and SHALL remember the phone per tenant (localStorage) to pre-fill step 2.

#### Scenario: Opening the flow from the QR
- **WHEN** a customer opens `/q/:tenantId/:branchId` for an active branch
- **THEN** the first screen shows the business and branch name with the choice "Retiro en local" or "Domicilio", and the menu later shows only dishes of that branch with their prices

#### Scenario: Phone is remembered per branch
- **WHEN** a customer who already ordered returns to a branch of the same tenant
- **THEN** the phone is pre-filled and one tap continues to the lookup

#### Scenario: Placing the order
- **WHEN** a pickup order is confirmed
- **THEN** the confirmation shows the order number, the total, the expected payment method, "Acércate a caja para pagar; preparamos tu pedido cuando esté pagado", and a "Ver estado de mi pedido" action

#### Scenario: Delivery confirmation
- **WHEN** a delivery order is confirmed
- **THEN** the confirmation shows the order number, "Pagas $X al recibir" with the expected payment method, the address, the estimated minutes, and a "Ver estado de mi pedido" action

#### Scenario: Confirming an empty cart is blocked
- **WHEN** the cart has no items
- **THEN** the action to go to the summary is disabled

### Requirement: Public order creation
The system SHALL provide a public endpoint `POST /api/public/orders` taking `tenantId`, `branchId`, `name`, `phone`, `orderType` (`qr` or `delivery`), `clientRequestId`, `expectedPaymentMethod`, optional `cashTendered`, `delivery` when the type is `delivery`, and items (`dishId`, `quantity`, optional `note` up to 140 characters). It SHALL validate the branch and dishes exactly like authenticated order creation, resolve prices server-side from the dish's branch override or default `salePrice`, assign the sequential order `number`, store each item with `stockApplied` `false`, store `clientName` and `clientPhone` on the order and the name on the customer record, and always store the order with `paymentStatus` `pending`.

#### Scenario: Prices are computed server-side
- **WHEN** a customer sends items with quantities
- **THEN** the order total is computed from the server-resolved dish prices, ignoring any client-sent price or total

#### Scenario: Customer identity is stored on the order and customer
- **WHEN** a public order is created with a name and phone
- **THEN** the order stores `clientName` and `clientPhone` (normalized), and the customer record for that phone keeps the provided name

#### Scenario: Item notes are stored
- **WHEN** an item is sent with the note "sin mayo"
- **THEN** the order item stores the note and the kitchen shows it

#### Scenario: App orders are never created as paid
- **WHEN** a public order is sent with any extra field claiming a payment
- **THEN** the order is stored with `paymentStatus` `pending`

#### Scenario: Rejecting a dish of another tenant
- **WHEN** an order item references a dish that does not belong to the branch's tenant or does not exist
- **THEN** the endpoint rejects the order with an error

#### Scenario: QR orders do not deduct stock
- **WHEN** an order is created through the public endpoint
- **THEN** every item is stored with `stockApplied` `false` and no stock is deducted

#### Scenario: Sequential numbering applies
- **WHEN** two customers place public orders for the same branch concurrently
- **THEN** each order receives a distinct sequential `number` from the branch counter

### Requirement: Customer chooses pickup or delivery
As the first screen after scanning the QR, before asking for the phone, the client app SHALL ask whether the order is "Retiro en local" (stored as `orderType` `qr`) or "Domicilio" (stored as `orderType` `delivery`). "Domicilio" SHALL be offered only when the public menu reports `deliveryAvailable` `true`; otherwise only pickup is shown with a note that the branch does not deliver.

#### Scenario: Pickup keeps the QR flow
- **WHEN** the customer chooses "Retiro en local"
- **THEN** the app asks for the phone and, once the customer is identified, shows the menu

#### Scenario: Delivery asks for an address
- **WHEN** the customer chooses "Domicilio"
- **THEN** the app asks for the phone and, once the customer is identified, shows the address step with their saved addresses before the menu

#### Scenario: Branch without delivery
- **WHEN** the branch has `deliveryAvailable` `false`
- **THEN** the app does not offer "Domicilio"

### Requirement: Delivery address with device location
For delivery orders the client app SHALL first suggest the customer's last used saved address and list the other saved ones, and SHALL offer "Usar otra dirección" with "Usar mi ubicación", which reads the device position through the browser Geolocation API after permission, shows it on a map with a draggable marker, and pre-fills an editable address. When permission is denied, the customer SHALL place the marker on the map manually. The customer SHALL be able to add a reference (apartment, directions). The public order endpoint SHALL require for delivery either `delivery.addressId` of a saved address or `delivery.address` with `delivery.lat` and `delivery.lng`, plus optional `delivery.reference` and `delivery.accuracy`.

#### Scenario: Last address is suggested
- **WHEN** a known customer with saved addresses chooses "Domicilio"
- **THEN** the last used address is pre-selected and the coverage estimate for it is shown

#### Scenario: Location permission granted
- **WHEN** the customer taps "Usar mi ubicación" and allows access
- **THEN** the map shows a marker at the device position and the address field is pre-filled

#### Scenario: Location permission denied
- **WHEN** the customer denies location access
- **THEN** the app explains it and lets the customer place the marker on the map and type the address

#### Scenario: Delivery without address is rejected
- **WHEN** a public order with `orderType` `delivery` has neither `delivery.addressId` nor `delivery.lat` and `delivery.lng`
- **THEN** the API rejects it with a validation error

### Requirement: Delivery estimate
The system SHALL estimate delivery as the straight-line (Haversine) distance between the branch and the customer multiplied by 1.4, and minutes as that distance divided by the branch `deliveryAvgSpeedKmh`, rounded up. The estimate SHALL be out of range when it exceeds the branch `deliveryMaxKm` or `deliveryMaxMinutes`. The server SHALL compute the estimate itself, store `deliveryDistanceKm`, `deliveryEtaMinutes`, and `deliveryOutOfRange` on the order, and SHALL reject a delivery order that is out of range, or for a branch without delivery available, with HTTP 422 and code `DELIVERY_OUT_OF_RANGE` or `DELIVERY_UNAVAILABLE`.

#### Scenario: Estimate shown before ordering
- **WHEN** the customer selects or fixes the delivery point
- **THEN** the app shows "Llegamos en ~X min (Y km)"

#### Scenario: Out of range warning
- **WHEN** the estimate exceeds the branch limits
- **THEN** the app tells the customer the address is outside the delivery zone, does not let them continue with that address, and offers to switch to "Retiro en local" or choose another address

#### Scenario: Branch without coordinates
- **WHEN** a public delivery order is sent for a branch without coordinates or without delivery limits
- **THEN** the API responds with HTTP 422 `DELIVERY_UNAVAILABLE` and creates no order

#### Scenario: Server rejects out of range
- **WHEN** a public delivery order is sent for a point outside the branch limits
- **THEN** the API responds with HTTP 422 `DELIVERY_OUT_OF_RANGE` and creates no order

#### Scenario: Client-sent estimate is ignored
- **WHEN** a public order includes its own distance or minutes values
- **THEN** the stored estimate is the one computed by the server

## ADDED Requirements

### Requirement: Order summary with expected payment
Before confirming, the client app SHALL show a summary with the items, notes, quantities, unit and line prices, the total, the delivery mode, and the address for delivery, and SHALL ask how the customer will pay: for pickup one of the branch's enabled methods among Efectivo, Débito, and Crédito; for delivery the summary SHALL state "Pagas al recibir tu pedido" above the choice between Efectivo or Tarjeta al recibir (sent as `card`, offered only when the branch accepts debit or credit), SHALL NOT offer transfer or any advance payment, and the confirm button SHALL read "Confirmar pedido · pagas $X al recibir". For cash the customer MAY indicate the amount they will pay with, which SHALL be at least the total. The app SHALL state that choosing a method does not mean the order is paid. The server SHALL reject an `expectedPaymentMethod` not enabled on the branch and a `cashTendered` below the total.

#### Scenario: Customer knows the total before confirming
- **WHEN** the customer opens the summary
- **THEN** the total is shown and the confirm action shows the same total

#### Scenario: Delivery states payment on delivery
- **WHEN** a delivery customer opens the summary
- **THEN** the app shows "Pagas al recibir tu pedido", offers only Efectivo and Tarjeta al recibir, and the confirm button shows the amount to pay on delivery

#### Scenario: Cash with amount
- **WHEN** a delivery customer chooses Efectivo and enters $10.000 for a $7.500 total
- **THEN** the order stores `expectedPaymentMethod` `cash` and `cashTendered` 10000

#### Scenario: Cash amount below total
- **WHEN** the customer enters a cash amount below the total
- **THEN** the app blocks confirmation and the API would reject it

#### Scenario: Method not enabled on the branch
- **WHEN** an order is sent with `expectedPaymentMethod` `credit` for a branch that only accepts cash and debit
- **THEN** the API rejects it with a validation error

### Requirement: Duplicate order protection
The client app SHALL generate a `clientRequestId` (UUID) when the summary is opened and reuse it for every retry of that confirmation, and SHALL disable the confirm action while a request is in flight. The server SHALL create at most one order per `(tenantId, clientRequestId)`: a repeated request with the same phone SHALL return the existing order with HTTP 200, and one with a different phone SHALL be rejected with HTTP 409.

#### Scenario: Double tap on confirm
- **WHEN** the customer taps "Confirmar pedido" twice quickly
- **THEN** only one order is created

#### Scenario: Retry after a network error
- **WHEN** the response is lost and the app retries with the same `clientRequestId`
- **THEN** the API returns the order created by the first request and no new number is consumed

### Requirement: Customer order tracking
After confirming, the client app SHALL keep the order number and its tracking token on the device and SHALL offer a tracking screen at `/q/:tenantId/:branchId/pedido/:number` that shows the order number, the mode, the items and total, the payment message ("Paga en caja" for pickup, "Pagas $X al recibir" for delivery), the estimated minutes for delivery, and a timeline with the customer-facing status. The screen SHALL refresh every 15 seconds while the order is active and stop refreshing once it reaches `delivered`, `rejected`, or `cancelled`. Re-opening the QR with an active order on the device SHALL show a "Tienes un pedido en curso #N" shortcut to the tracking screen.

Customer-facing statuses SHALL be: "Pendiente de pago en caja" (pickup, `new`, payment `pending`), "Recibido" (delivery, `new`), "En preparación", "Listo para retirar", "Listo para despacho", "En reparto", "Entregado", "Rechazado por el local" with the reason, and "Anulado".

#### Scenario: Tracking a delivery order in preparation
- **WHEN** the kitchen moves the customer's delivery order #16 to `preparing`
- **THEN** within 15 seconds the tracking screen shows "#16 · En preparación" and "Pagas $6.000 al recibir"

#### Scenario: Tracking an order out for delivery
- **WHEN** a driver takes the order out for delivery
- **THEN** the tracking screen shows "En reparto"

#### Scenario: Order rejected by the seller
- **WHEN** the cashier rejects the customer's order with the reason "No tenemos pan de completo"
- **THEN** the tracking screen shows "Rechazado por el local" with that reason and stops refreshing

#### Scenario: Returning with an active order
- **WHEN** the customer scans the QR again while their order is `preparing`
- **THEN** the app offers "Tienes un pedido en curso #16" before starting a new order

### Requirement: Public order tracking endpoint
The public order creation SHALL return a random `trackingToken` once, storing only its SHA-256 hash on the order. The system SHALL provide `POST /api/public/orders/track` taking `tenantId` and `trackingToken` in the body, rate limited like other public endpoints, that returns the order number, mode, customer-facing status, items, total, expected payment method, estimated minutes, rejection reason, and status timestamps. It SHALL NOT return the address, coordinates, phone, customer name, or any other order, and SHALL respond with HTTP 404 for an unknown token.

#### Scenario: Valid token
- **WHEN** the app sends the token returned when the order was created
- **THEN** the response contains that order's number and customer-facing status

#### Scenario: Guessing by order number is not possible
- **WHEN** someone requests tracking with an order number or an invented token
- **THEN** the endpoint responds with HTTP 404 and exposes no order data

#### Scenario: No personal data in tracking
- **WHEN** a delivery order is tracked
- **THEN** the response contains no address, coordinates, phone, or name
