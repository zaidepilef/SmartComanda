## Purpose

Provides the kiosk-style order-taking screen: dish catalog grouped by category, cart with quantities and notes, customer and order type, and simulated in-person payment using the branch's configured methods.

## ADDED Requirements

### Requirement: Product catalog by category
The POS SHALL present the tenant's active dishes grouped by category, each card showing the dish icon, name, sale price, and description, and SHALL let the user filter by category or search by name. The sale price SHALL be the branch's override price when one exists for the selected branch, otherwise the dish's default sale price. Inactive dishes SHALL NOT appear.

#### Scenario: Dishes grouped by category
- **WHEN** the POS loads the catalog for the selected branch
- **THEN** dishes appear grouped by their category, each with its icon, name, sale price, and description

#### Scenario: Filtering by category
- **WHEN** the user selects a category
- **THEN** only dishes of that category are shown

#### Scenario: Searching by name
- **WHEN** the user types a search term
- **THEN** only dishes whose name matches are shown

#### Scenario: Hiding inactive dishes
- **WHEN** a dish is marked inactive
- **THEN** the dish does not appear in the POS catalog

#### Scenario: Showing the branch sale price
- **WHEN** the selected branch has a sale price override for a dish
- **THEN** the card shows the override price instead of the default sale price

### Requirement: Order cart
The POS SHALL maintain the current order as a list of items (dish, quantity, unit price, and optional note), SHALL let the user add dishes, change quantities, edit notes, and remove items, and SHALL compute the subtotal and total. Charging SHALL require at least one item.

#### Scenario: Adding a dish to the order
- **WHEN** the user selects a dish and confirms the quantity and note
- **THEN** the dish is added to the order with its unit price

#### Scenario: Changing a quantity
- **WHEN** the user increases or decreases an item's quantity
- **THEN** the item total and the order total are recomputed

#### Scenario: Editing a note
- **WHEN** the user edits the note of an item
- **THEN** the note is stored with the item

#### Scenario: Removing an item
- **WHEN** the user removes an item from the order
- **THEN** the item disappears and the order total is recomputed

#### Scenario: Blocking checkout with an empty cart
- **WHEN** the order has no items
- **THEN** the charge action is disabled

### Requirement: Customer and order type
Before charging, the POS SHALL let the user set the order type — `takeaway` (default), `dinein`, `delivery`, or `qr` — and optionally capture customer name, phone, and note, which SHALL be recorded in the order's `clientContact`.

#### Scenario: Order type defaults to takeaway
- **WHEN** a new order starts
- **THEN** its type is `takeaway`

#### Scenario: Selecting another order type
- **WHEN** the user selects `dinein`, `delivery`, or `qr`
- **THEN** the order is stored with the selected type

#### Scenario: Recording optional customer info
- **WHEN** the user enters customer name, phone, and a note
- **THEN** the order's `clientContact` contains that information

### Requirement: Simulated payment with branch methods
The POS SHALL offer only the payment methods configured on the branch (`cash`, `debit`, `credit`, `transfer`). For cash, the POS SHALL capture the received amount, show the change, and block confirmation while the received amount is below the total. For card and transfer, the POS SHALL confirm via a simulated approval step. Confirming SHALL create the paid order and start a new empty order.

#### Scenario: Offering only configured methods
- **WHEN** the payment screen opens for a branch configured with `cash` and `debit`
- **THEN** only Efectivo and Débito are offered

#### Scenario: Cash payment with change
- **WHEN** the user pays in cash with a received amount above the total
- **THEN** the change is shown and confirmation creates the paid order with method `cash`

#### Scenario: Blocking insufficient cash
- **WHEN** the received cash amount is below the total
- **THEN** the POS blocks confirmation with an error

#### Scenario: Simulated card and transfer approval
- **WHEN** the user selects `debit`, `credit`, or `transfer` and confirms the simulated approval
- **THEN** the paid order is created with the selected method

#### Scenario: New order after payment
- **WHEN** a payment is confirmed
- **THEN** the POS clears the cart and starts a new empty order

### Requirement: Cash session gate for charging
The POS SHALL block charging while the selected branch has no open cash session and SHALL prompt the user to open one.

#### Scenario: Charging without an open session
- **WHEN** the user attempts to charge and the branch has no open cash session
- **THEN** the POS blocks the payment and shows the prompt to open the cash session

#### Scenario: Charging with an open session
- **WHEN** the user charges and the branch has an open cash session
- **THEN** the payment flow proceeds

### Requirement: Stock deduction for order items
The POS SHALL request stock deduction for each order item, and SHALL inform the user when an item could not be deducted due to insufficient stock, creating the order with that item not deducted from stock.

#### Scenario: Items request stock deduction
- **WHEN** an order is created
- **THEN** each item requests stock deduction and the deduction is applied when stock is available

#### Scenario: Warning on insufficient stock
- **WHEN** a dish's ingredients lack stock for the requested quantity
- **THEN** the sale proceeds, the item is stored without stock deduction, and the POS shows a warning naming the dish