# cash-session-closure Specification

## Purpose

Allows closing a branch's cash session with a per-method cash-out count (arqueo), recording final totals, sales count, and the difference between the system totals and the physical count.

## Requirements

### Requirement: Close an open cash session
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users of the session's tenant to close the open cash session of a branch, and SHALL reject the action for `cook` users with HTTP 403. The close SHALL accept per-method counted amounts (`cash`, `debit`, `credit`, `transfer`) entered by hand and an optional note (at most 500 characters). For `cash`, the expected amount SHALL be the opening amount plus the cash total; for other methods, the method total. The system SHALL persist on the session the expected amount, the counted amount, and the signed difference (counted minus expected) per method, the order count, the note, `closedAt`, and `closedBy`, and SHALL return them in the close response and when reading the session later.

#### Scenario: Closing a session with matching count
- **WHEN** a `cashier` closes the open session of their branch providing counted amounts equal to the expected amounts
- **THEN** the session is marked `closed` with `closedAt` and `closedBy`, stores the expected and counted amounts and the order count, and records a zero difference for every method

#### Scenario: Closing with a count discrepancy
- **WHEN** a `cashier` closes the session with $48000 counted in cash and the expected cash is $50000
- **THEN** the session stores a cash difference of -2000, and the difference is shown in the close response

#### Scenario: Closing without an explicit count
- **WHEN** a `cashier` closes the session without providing counted amounts
- **THEN** the system uses the expected amounts as the counted amounts, resulting in a zero difference

#### Scenario: Closing persists the arqueo
- **WHEN** a closed session is read after closing
- **THEN** it returns the expected, counted, and difference per method, and the note

#### Scenario: Closing a session that does not exist or belongs to another tenant
- **WHEN** a user attempts to close a cash session that does not exist or belongs to another tenant
- **THEN** the system responds with HTTP 404

#### Scenario: Closing an already closed session
- **WHEN** a user attempts to close a cash session that is already closed
- **THEN** the system responds with HTTP 409 and no changes are made

#### Scenario: Rejecting negative closing amounts
- **WHEN** a `cashier` provides a negative closing amount for any method
- **THEN** the system responds with HTTP 400 and the session stays open

#### Scenario: Cook cannot close a session
- **WHEN** a `cook` attempts to close a cash session
- **THEN** the system responds with HTTP 403 and the session stays open

### Requirement: Reopen a closed branch
The system SHALL allow opening a new cash session for a branch once its previous session is closed.

#### Scenario: Opening after closing
- **WHEN** a `cashier` opens a cash session for a branch whose previous session is closed
- **THEN** the system responds with HTTP 201 and a new open session is created
