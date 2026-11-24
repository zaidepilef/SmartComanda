## ADDED Requirements

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
