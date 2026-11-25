## ADDED Requirements

### Requirement: Chilean mobile phone format
The system SHALL identify customers by a Chilean mobile number stored in the canonical form `+569` followed by 8 digits. Public endpoints SHALL accept `9XXXXXXXX`, `569XXXXXXXX`, or `+569XXXXXXXX`, normalize them to the canonical form, and reject any other value with a validation error. The client app SHALL show `+569` as a fixed prefix, accept only the remaining 8 digits through a numeric keyboard, strip non-digit characters, and enable "Continuar" only when exactly 8 digits are entered.

#### Scenario: Normalizing a phone
- **WHEN** a public request sends the phone `912345678`
- **THEN** the system uses `+56912345678`

#### Scenario: Rejecting a non-mobile phone
- **WHEN** a public request sends `+56221234567` or a value with letters
- **THEN** the endpoint rejects it with a validation error

#### Scenario: Entering the phone in the app
- **WHEN** the customer types `1234-567a8` after the fixed `+569` prefix
- **THEN** the field keeps only `12345678` and "Continuar" becomes enabled

#### Scenario: Incomplete phone
- **WHEN** the customer has typed 7 digits
- **THEN** "Continuar" stays disabled and the app explains that 8 digits are needed

### Requirement: Public customer lookup
The system SHALL provide `POST /api/public/customers/lookup` taking `tenantId`, `branchId`, and `phone`, validated like other public endpoints and rate limited per IP and per phone more strictly than the menu. For a known customer of the tenant it SHALL return `known: true`, the customer's first name, the saved delivery addresses as `{ id, label }` ordered by most recent use, and `lastAddressId`. For an unknown phone it SHALL return `known: false` only. The response SHALL NOT include full addresses, references, coordinates, order history, or data of other tenants.

#### Scenario: Known customer
- **WHEN** the app looks up a phone that has a customer named "Ana Pérez" with two saved addresses
- **THEN** the response is `known: true`, `firstName` "Ana", two masked address labels, and the id of the most recently used one

#### Scenario: Unknown customer
- **WHEN** the app looks up a phone with no customer for the tenant
- **THEN** the response is `known: false` and creates no customer

#### Scenario: Customer of another tenant
- **WHEN** the phone belongs to a customer of a different tenant only
- **THEN** the response is `known: false`

#### Scenario: Masked address label
- **WHEN** a saved address is "Av. Providencia 1234, depto 56"
- **THEN** its label shows the street and only the first digits of the number, for example "Av. Providencia 12…", without the reference

#### Scenario: Lookup rate limit
- **WHEN** the same IP or phone exceeds the lookup limit
- **THEN** the endpoint responds with HTTP 429

### Requirement: Welcome and name capture
After the phone lookup the client app SHALL greet a known customer by first name with "¡Qué rico volver a verte, {nombre}!" and continue without asking for the name, offering a "¿No eres tú?" action to change it. For an unknown phone it SHALL ask only for the name (1 to 80 characters) before continuing. A name entered or changed by the customer SHALL be stored on the customer record when the order is created.

#### Scenario: Returning customer is greeted
- **WHEN** a known customer enters their phone
- **THEN** the app shows the welcome message with their first name and continues to the address step for delivery or to the menu for pickup

#### Scenario: New customer gives their name
- **WHEN** an unknown phone is entered
- **THEN** the app asks for the name and continues only after a valid name is entered

#### Scenario: Correcting the name
- **WHEN** a known customer taps "¿No eres tú?" and enters a different name, then places an order
- **THEN** the customer record and the order store the new name

### Requirement: Saved delivery addresses
The system SHALL keep up to 5 delivery addresses per customer in `customer_addresses`, each with address text, optional reference, coordinates, and `last_used_at`. Creating a delivery order with a new address SHALL save it; an address with the same normalized text or within 30 meters of a saved one SHALL reuse it and update `last_used_at`. When a sixth address is saved, the least recently used one SHALL be removed. A delivery order MAY reference a saved address by `delivery.addressId`, which the server SHALL resolve only among the addresses of the order's customer.

#### Scenario: First delivery saves the address
- **WHEN** a customer places their first delivery order with coordinates
- **THEN** the address is saved for that customer and becomes their last used address

#### Scenario: Reusing a saved address
- **WHEN** a customer places a delivery order with `delivery.addressId` of one of their addresses
- **THEN** the order stores that address text, reference, and coordinates, and the address `last_used_at` is updated

#### Scenario: Address of another customer
- **WHEN** an order sends an `addressId` that does not belong to the customer of the given phone
- **THEN** the endpoint rejects the order with a validation error

#### Scenario: Address limit
- **WHEN** a customer with 5 saved addresses uses a new one
- **THEN** the least recently used address is removed and the new one is saved
