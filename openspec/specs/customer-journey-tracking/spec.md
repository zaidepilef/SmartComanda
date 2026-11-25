# customer-journey-tracking Specification

## Purpose
Registra el recorrido de cada cliente en el flujo de pedido por QR, desde que abre el enlace hasta que su pedido se crea o falla, sin guardar datos personales en los eventos, para dar trazabilidad al local y diagnosticar errores y abandonos.

## Requirements

### Requirement: Journey session
The client app SHALL assign an anonymous session identifier to each visit of `/q/:tenantId/:branchId`, SHALL attach it to every event of that visit, and SHALL keep it for the browser tab until the visit ends or an order is created.

#### Scenario: New visit starts a session
- **WHEN** a customer opens a branch QR link in a new tab
- **THEN** a new session identifier is generated and a `qr_opened` event is recorded with the tenant and branch

#### Scenario: New order starts a new session
- **WHEN** a customer taps "Hacer otro pedido" after an order was created
- **THEN** subsequent events belong to a new session

### Requirement: Journey event types
The system SHALL record the following event types for a session: `qr_opened`, `menu_loaded`, `menu_failed`, `identity_submitted`, `item_added`, `item_removed`, `cart_opened`, `order_submitted`, `order_created`, and `order_failed`. Each event SHALL carry the session identifier, tenant, branch, event type, the time it occurred, and only the type-specific data needed to explain it (dish and quantity for cart events, order number and total for `order_created`, error status and reason for failures).

#### Scenario: Identity step is traced
- **WHEN** the customer submits the name and phone form
- **THEN** an `identity_submitted` event is recorded and the session becomes linked to that customer

#### Scenario: Failed order is traced with its reason
- **WHEN** the order submission fails
- **THEN** an `order_failed` event is recorded with the HTTP status (or network error) and the error reason returned by the API

#### Scenario: Successful order is traced
- **WHEN** the order is created
- **THEN** an `order_created` event is recorded and the session is linked to the created order

### Requirement: Public event ingestion
The system SHALL provide a public endpoint that accepts a batch of journey events for one session, SHALL validate the tenant, branch, event types and payload sizes, SHALL reject events for inactive or unknown branches, and SHALL apply rate limiting. Event ingestion failures MUST NOT block or alter the customer's ordering flow.

#### Scenario: Valid batch is stored
- **WHEN** the client sends a batch of valid events for an active branch
- **THEN** all events are stored and the endpoint responds with success

#### Scenario: Invalid event type is rejected
- **WHEN** a batch contains an unknown event type or an oversized payload
- **THEN** the endpoint rejects the batch with a validation error and stores nothing

#### Scenario: Tracking outage does not affect ordering
- **WHEN** the events endpoint is unavailable
- **THEN** the customer can still load the menu and place the order normally

### Requirement: Server-side order outcome
The backend SHALL record, independently of the client, an `order_created` or `order_failed` event for every public order attempt that carries a session identifier, including the validation or business reason when the order is rejected.

#### Scenario: Validation rejection is recorded by the server
- **WHEN** a public order is rejected because the name or phone is missing or invalid
- **THEN** the server records an `order_failed` event for that session with the validation reason, even if the client never sends its own event

### Requirement: Journey data privacy and retention
The system SHALL NOT store the customer's name or phone inside journey events; events SHALL reference the customer record instead. Journey events SHALL be readable only by authenticated users of the same tenant, and SHALL be deleted automatically after the retention period of 90 days.

#### Scenario: Events do not duplicate personal data
- **WHEN** an `identity_submitted` event is stored
- **THEN** the event references the customer record and contains no name or phone

#### Scenario: Old events are purged
- **WHEN** an event is older than 90 days
- **THEN** it is removed by the retention process

### Requirement: Purchase flow journey events
The client app SHALL record journey events for the purchase flow steps, in addition to the existing event types: `mode_selected` with the chosen mode (`pickup` or `delivery`), `customer_looked_up` with whether the phone belongs to a known customer, `address_confirmed` with whether a saved or a new address was used, `address_out_of_range` with the distance in kilometres, and `summary_opened` with the item count and total. These events MUST NOT carry the customer's name, phone, address text, reference or coordinates, and the backend SHALL reject any extra field. They SHALL NOT change how the session stage is derived.

#### Scenario: Mode choice is traced
- **WHEN** the customer chooses Retiro or Domicilio, or switches to pickup because the address is out of coverage
- **THEN** a `mode_selected` event is recorded with `pickup` or `delivery`

#### Scenario: Lookup result is traced without the phone
- **WHEN** the phone lookup finishes
- **THEN** a `customer_looked_up` event is recorded with `known` true or false and without the phone number

#### Scenario: Out-of-coverage address is traced once per attempt
- **WHEN** the delivery estimate changes from in range (or unknown) to out of range
- **THEN** an `address_out_of_range` event is recorded with the rounded distance, and no new event is recorded while the point stays out of range

#### Scenario: Address step is traced without the address
- **WHEN** the customer continues from the address step
- **THEN** an `address_confirmed` event is recorded with `saved` or `new` and without the address text or coordinates

#### Scenario: Summary is traced
- **WHEN** the customer opens the order summary
- **THEN** a `summary_opened` event is recorded with the item count and the total

#### Scenario: Personal data is rejected
- **WHEN** a batch contains a purchase flow event with a phone, name or address field
- **THEN** the endpoint rejects the batch with a validation error and stores nothing
