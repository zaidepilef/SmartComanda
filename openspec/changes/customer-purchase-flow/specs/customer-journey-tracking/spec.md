## ADDED Requirements

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
