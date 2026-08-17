## Purpose

Implements v1 of the loyalty program: customers identified by WhatsApp number, a per-tenant configurable points-per-amount rule, and idempotent point accrual when the cash register charges a QR order, with the balance visible to the customer and the rule editable from the admin.

## ADDED Requirements

### Requirement: Customer identity by phone
The system SHALL maintain a `customers` collection where each customer is identified by `tenantId` and `phone` (unique per tenant), optionally carrying a name, and SHALL upsert the customer on first order so any phone can accumulate points without registration.

#### Scenario: Customer created on first order
- **WHEN** a public order arrives with a phone that has no customer for the tenant
- **THEN** a customer is created for `(tenantId, phone)` with a zero balance

#### Scenario: Existing customer is reused
- **WHEN** a public order arrives with a phone that already has a customer for the tenant
- **THEN** the existing customer document is used and its balance is preserved

### Requirement: Tenant-configurable points rule
Each tenant SHALL be able to configure `loyalty.pointsPerAmount` (CLP per point, e.g., `1000` = 1 point per `$1000` spent) and `loyalty.currency` from the admin panel. While the rule is unset or zero, no points SHALL be awarded.

#### Scenario: Editing the points rule
- **WHEN** an `admin` or `owner` edits the tenant's `pointsPerAmount` in the admin panel
- **THEN** the new value is persisted and applied to subsequent charges

#### Scenario: Rule off by default or zero
- **WHEN** a tenant has no `loyalty` rule or `pointsPerAmount` is zero or absent
- **THEN** no points are awarded and no ledger transaction is created

### Requirement: Points award on payment
The system SHALL award points when an order with `orderType` `qr` and a valid `clientPhone` is charged (becomes `paid`): `points = floor(total / pointsPerAmount)`, awarded by `$inc` on the customer's `pointsBalance` plus an immutable `loyalty-transactions` record (type `earn`, `points`, `sourceOrderId`, `branchId`, `tenantId`, timestamp). The award SHALL be idempotent: each order awards points at most once.

#### Scenario: Awarding points on charge
- **WHEN** a cashier charges a QR order of `$4500` for a tenant with `pointsPerAmount` `1000` and the customer's phone
- **THEN** the customer's balance increases by 4 and a `loyalty-transactions` record references the order

#### Scenario: Charges without phone award nothing
- **WHEN** a cashier charges a QR order with no `clientPhone`
- **THEN** no points are awarded and no ledger transaction is created

#### Scenario: Non-QR orders award nothing
- **WHEN** a cashier charges an order of type `takeaway`, `dinein`, or `delivery` at the same tenant
- **THEN** no points are awarded for it

#### Scenario: Idempotent award
- **WHEN** the same order is processed for payment or the award path runs again
- **THEN** points are awarded only once and the balance is not incremented a second time

### Requirement: Customer balance visibility
The system SHALL expose the customer's current `pointsBalance` to the ordering app (`GET /api/public/customers/balance`) and SHALL include the updated balance and the earned points in the flow.

#### Scenario: Balance after paying at the register
- **WHEN** the cashier charges the customer's QR order
- **THEN** the customer's balance includes the newly earned points

#### Scenario: Showing balance in the ordering app
- **WHEN** the ordering app resolves the balance for `(tenantId, phone)`
- **THEN** the response returns the current balance or zero for an unknown phone

### Requirement: Points badge in the POS
The POS SHALL inform the cashier with a "+X puntos" badge when charging an eligible QR order, where X is the points the customer will earn for the order total.

#### Scenario: Badge on eligible charge
- **WHEN** a cashier charges a QR order with a phone for a tenant with the rule configured
- **THEN** the POS shows "+X puntos" with `X` = `floor(total / pointsPerAmount)` before confirming