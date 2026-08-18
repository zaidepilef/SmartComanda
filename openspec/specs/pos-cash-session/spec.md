# pos-cash-session Specification

## Purpose

Lets POS users open a cash session per branch and view the branch's sales totals by payment method; closing the session is deliberately deferred to a future change.

## Requirements

### Requirement: Open cash session
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users to open a cash session for a branch with an opening amount (zero or greater), SHALL reject opening a second session while one is already open for the same branch, and SHALL record the user who opened it and the timestamp.

#### Scenario: Opening a session with an opening amount
- **WHEN** a `cashier` opens a cash session for a branch with an opening amount of 50000
- **THEN** the session is stored as open with the opening amount, the opener, and the timestamp

#### Scenario: Rejecting a second open session
- **WHEN** a user tries to open a session for a branch that already has an open one
- **THEN** the system rejects the request with an error

#### Scenario: Rejecting a negative opening amount
- **WHEN** a user opens a session with a negative opening amount
- **THEN** the system rejects the request with an error

### Requirement: View current session
The POS SHALL show the branch's open cash session — opening amount, totals per payment method, and order count — and SHALL show an open prompt when the branch has none. Sessions SHALL be scoped to their branch.

#### Scenario: Viewing the open session
- **WHEN** the branch has an open session
- **THEN** the screen shows the opening amount, the totals per method, and the order count

#### Scenario: Showing the open prompt
- **WHEN** the branch has no open session
- **THEN** the screen shows the prompt to open one

#### Scenario: Sessions are branch-scoped
- **WHEN** two branches have sessions open
- **THEN** each branch's screen shows only its own session

### Requirement: Cash session closure is deferred
The system SHALL NOT expose an endpoint to close cash sessions yet. Session documents SHALL reserve the `status`, `closedAt`, and `closedBy` fields so a future change can close them without a migration.

#### Scenario: No close endpoint exists
- **WHEN** a client requests to close a cash session
- **THEN** the API responds with 404 because the route does not exist

#### Scenario: Session documents reserve closure fields
- **WHEN** a session is stored as open
- **THEN** its document has `status` set to `open` and `closedAt` and `closedBy` reserved as null