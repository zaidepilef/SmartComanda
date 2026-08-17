## Purpose

Lets cashier, admin, owner, and sysadmin users sign in to the POS, with sysadmin choosing the tenant and branch to operate in before entering the order-taking screen.

## ADDED Requirements

### Requirement: POS login
The system SHALL authenticate POS users with email and password plus a Turnstile captcha token, and SHALL only accept users whose role is `cashier`, `admin`, `owner`, or `sysadmin` and whose account is active. Tenant-scoped users (`cashier`, `admin`, `owner`) SHALL land directly in the POS scoped to their tenant; a `sysadmin` SHALL land in the tenant picker.

#### Scenario: Logging in as a tenant-scoped user
- **WHEN** an active `cashier`, `admin`, or `owner` logs in with valid credentials and a valid captcha token
- **THEN** the user enters the POS scoped to their tenant

#### Scenario: Rejecting invalid credentials
- **WHEN** a user submits an incorrect email or password
- **THEN** the system rejects the login with an error and the user stays on the login screen

#### Scenario: Rejecting an unavailable account
- **WHEN** the account is inactive or pending verification
- **THEN** the system rejects the login with an error

#### Scenario: sysadmin lands in the tenant picker
- **WHEN** a `sysadmin` logs in with valid credentials
- **THEN** the sysadmin is taken to the tenant picker instead of the POS

### Requirement: Tenant selection for sysadmin
The system SHALL let a `sysadmin` choose the tenant to operate in and SHALL scope the POS (branches, dishes, prices, orders) to that tenant until the sysadmin changes it or logs out.

#### Scenario: Choosing a tenant
- **WHEN** a `sysadmin` selects a tenant from the tenant picker
- **THEN** the branch selection for that tenant is shown and the catalog resolves against that tenant

#### Scenario: Orders are created in the selected tenant
- **WHEN** a `sysadmin` creates an order after selecting a tenant
- **THEN** the order is created for a branch of the selected tenant

### Requirement: Branch selection
The POS SHALL require the selection of an active branch before taking orders. A tenant-scoped user SHALL choose among the active branches of their tenant; a `sysadmin` SHALL choose among the active branches of the selected tenant. The chosen branch SHALL persist across reloads until changed.

#### Scenario: Single active branch enters the POS directly
- **WHEN** a tenant-scoped user has exactly one active branch
- **THEN** the POS opens directly with that branch selected

#### Scenario: Choosing among several branches
- **WHEN** a user has more than one active branch
- **THEN** the user selects a branch and the selection is remembered after a reload

#### Scenario: Branch defines the operating context
- **WHEN** a branch is selected
- **THEN** dish prices, payment methods, stock deductions, and the cash session resolve against that branch