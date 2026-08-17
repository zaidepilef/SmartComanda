## MODIFIED Requirements

### Requirement: Orders collection schema
The system SHALL store on each order onward from the migration: `clientPhone` (the customer's WhatsApp number, a string, present for public QR orders) and `pointsAwarded` (boolean flag, present and true once loyalty points were granted for the order). The existing `clientContact` free-form string SHALL remain unchanged.

#### Scenario: Public orders store the phone
- **WHEN** a public QR order is stored with `clientPhone`
- **THEN** the document is accepted with `clientContact` still optional and `clientPhone` retrievable

#### Scenario: Awarded orders carry the flag
- **WHEN** an order's points have been granted
- **THEN** the document stores `pointsAwarded` as true

## ADDED Requirements

### Requirement: Customers collection schema
The system SHALL provide a migration that creates a `customers` collection in MongoDB where each document contains `tenantId` (reference to a tenant), `phone` (WhatsApp number), optional `firstName`, `pointsBalance` (integer, default 0), and `createdAt`/`updatedAt`. `(tenantId, phone)` SHALL be unique.

#### Scenario: Applying the migration creates the customers collection
- **WHEN** the migration runs on a database without a `customers` collection
- **THEN** a `customers` collection exists, indexed on `tenantId` and enforcing uniqueness of `phone` within each tenant

#### Scenario: Duplicate phones within a tenant are rejected
- **WHEN** a customer is stored with a `(tenantId, phone)` pair that already exists
- **THEN** the insert fails on the unique index

### Requirement: Loyalty transactions collection schema
The system SHALL provide a migration that creates a `loyalty-transactions` collection in MongoDB where each document is an immutable ledger entry containing `tenantId`, `branchId`, `customerId`, `type` (`earn`), `points` (integer), `sourceOrderId` (reference to the order that produced it), and `createdAt`. The collection SHALL be indexed on `customerId` and `sourceOrderId`.

#### Scenario: Applying the migration creates the loyalty-transactions collection
- **WHEN** the migration runs on a database without a `loyalty-transactions` collection
- **THEN** a `loyalty-transactions` collection exists with the documented fields and indexes

#### Scenario: One transaction per award
- **WHEN** an order earns points
- **THEN** exactly one ledger entry is stored for the order, referencing it via `sourceOrderId`

### Requirement: Tenant loyalty configuration
The `tenants` collection SHALL accept an optional `loyalty` document with `pointsPerAmount` (positive integer, CLP per point) and `currency` (default `CLP`); its absence or a zero `pointsPerAmount` disables awarding.

#### Scenario: Storing the loyalty rule
- **WHEN** an `admin` updates the tenant with `loyalty: {pointsPerAmount: 1000, currency: "CLP"}`
- **THEN** the tenant document stores the rule and existing tenants without `loyalty` remain valid