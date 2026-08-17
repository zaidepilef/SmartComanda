## Purpose

Provides role-scoped order listing and filtering for the admin panel and the kitchen display, letting operators search, filter, and inspect orders with their item snapshots and payment data.

## ADDED Requirements

### Requirement: List orders with filters
The system SHALL provide an order listing endpoint that accepts filters for branch, order status, order type, payment status, payment method, and date range, plus a free-text search over the order number and client contact, and SHALL return the newest orders first.

#### Scenario: Listing orders of a branch
- **WHEN** an `admin` requests the orders of one of their tenant's branches
- **THEN** the system returns the branch's orders newest first, each with number, status, order type, payment status, method, total, item snapshots, and timestamps

#### Scenario: Filtering by status and payment method
- **WHEN** an operator requests orders filtered by `status=ready` and `paymentMethod=debit`
- **THEN** the system returns only orders matching both filters

#### Scenario: Searching by order number
- **WHEN** an operator searches for the order number `42`
- **THEN** the system returns the order with that number

#### Scenario: Empty result
- **WHEN** a filter combination matches no orders
- **THEN** the system returns an empty list

### Requirement: Order listing access control
The system SHALL scope order listings by role: `cashier` sees only their own branch's orders, `admin`/`owner` see their tenant's orders, and `sysadmin` can list any tenant's orders via the `tenantId` parameter.

#### Scenario: Cashier listing is branch-scoped
- **WHEN** a `cashier` requests orders without a branch filter
- **THEN** the system returns only the orders of the cashier's branch

#### Scenario: Cashier cannot see another branch's orders
- **WHEN** a `cashier` requests orders filtering by a branch of another tenant or of a different branch than their own
- **THEN** the system ignores or rejects the out-of-scope branch and returns only the cashier's branch orders

#### Scenario: Sysadmin lists any tenant's orders
- **WHEN** a `sysadmin` requests orders with a `tenantId`
- **THEN** the system returns that tenant's orders

### Requirement: Order detail
The system SHALL provide an endpoint to fetch a single order by id, scoped by the same access rules as listing.

#### Scenario: Fetching an order detail
- **WHEN** an operator requests a single order by id
- **THEN** the system returns the full order including item snapshots, totals, statuses, and timestamps

#### Scenario: Fetching an out-of-scope order
- **WHEN** a `cashier` requests an order from another branch or tenant
- **THEN** the system responds with HTTP 404
