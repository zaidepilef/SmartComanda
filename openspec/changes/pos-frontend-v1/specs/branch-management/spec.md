## ADDED Requirements

### Requirement: Branch payment methods
Each branch SHALL declare the payment methods it works with, a subset of `cash`, `debit`, `credit`, and `transfer`. When not specified, the branch SHALL accept all four. `sysadmin`, `admin`, and `owner` users SHALL be able to set the payment methods when creating or updating a branch, and the branch listing SHALL include them. The POS SHALL offer only the branch's methods at checkout.

#### Scenario: Creating a branch without payment methods
- **WHEN** a branch is created without `paymentMethods`
- **THEN** the branch accepts `cash`, `debit`, `credit`, and `transfer`

#### Scenario: Setting payment methods on creation
- **WHEN** a `sysadmin` creates a branch with `paymentMethods` `["cash", "debit"]`
- **THEN** the branch is stored accepting only cash and debit

#### Scenario: Updating a branch's payment methods
- **WHEN** an `owner` updates a branch's `paymentMethods` to `["cash", "transfer"]`
- **THEN** the change is stored and reflected in subsequent listings

#### Scenario: Rejecting an invalid payment method
- **WHEN** a branch is created or updated with a payment method outside the four supported values
- **THEN** the system rejects the request with an error

### Requirement: POS branch listing access
The system SHALL allow `cashier` users to list the active branches of their own tenant, including each branch's `paymentMethods`, so the POS can resolve the branch context. `cashier` users SHALL NOT create, update, or delete branches.

#### Scenario: Cashier lists own tenant's branches
- **WHEN** a `cashier` requests the branch list
- **THEN** the system returns the active branches of their tenant with their payment methods

#### Scenario: Cashier cannot modify branches
- **WHEN** a `cashier` attempts to create, update, or delete a branch
- **THEN** the system rejects the request with an authorization error