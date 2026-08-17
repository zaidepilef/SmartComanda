# order-receipt Specification

## Purpose

Generates a printable receipt (boleta) for a confirmed paid order on the point of sale, giving the customer a paper record of their purchase without backend involvement.

## Requirements

### Requirement: Printable receipt after payment
The system SHALL present a printable receipt immediately after a paid order is confirmed, containing the branch name, date and time, order number, order type, each item with name, quantity, observations, unit price and line total, the order total, the payment method, and — when paying by cash — the received amount and change.

#### Scenario: Receipt for a cash order
- **WHEN** a `cashier` confirms a cash payment with a received amount greater than the total
- **THEN** the receipt shows the branch, date, order number, items, total, "cash", received amount, and change

#### Scenario: Receipt for a card order
- **WHEN** a `cashier` confirms a debit or credit payment
- **THEN** the receipt shows the method without received amount or change

#### Scenario: Printing the receipt
- **WHEN** the receipt is displayed
- **THEN** the system offers a print action that prints only the receipt area

### Requirement: Receipt data provenance
The system SHALL render the receipt exclusively from the order creation response and the local session context; no additional server request is required.

#### Scenario: Receipt after offline confirmation
- **WHEN** the order response is available in the client
- **THEN** the receipt renders without further server calls