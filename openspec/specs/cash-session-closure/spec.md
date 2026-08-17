# cash-session-closure Specification

## Purpose

Allows closing a branch's cash session with a per-method cash-out count (arqueo), recording final totals, sales count, and the difference between the system totals and the physical count.

## Requirements

### Requirement: Close an open cash session
The system SHALL provide an endpoint to close the open cash session of a branch, accepting optional per-method closing amounts (`cash`, `debit`, `credit`, `transfer`) recorded by the cashier, and SHALL finalize the session with its totals snapshot, sales count, and the difference per method between the recorded closing amount and the system total.

#### Scenario: Closing a session with matching count
- **WHEN** a `cashier` closes the open session of their branch providing closing amounts equal to the system totals
- **THEN** the session is marked `closed` with `closedAt` and `closedBy`, stores the final totals and sales count, and records a zero difference for every method

#### Scenario: Closing with a count discrepancy
- **WHEN** a `cashier` closes the session providing a closing amount that differs from the system total for a method
- **THEN** the session records the closing amount and the signed difference for that method, and the difference is surfaced in the close response

#### Scenario: Closing without an explicit count
- **WHEN** a `cashier` closes the session without providing closing amounts
- **THEN** the system uses the recorded totals as the closing amounts, resulting in a zero difference

#### Scenario: Closing a session that does not exist or belongs to another tenant
- **WHEN** a user attempts to close a cash session that does not exist or belongs to another tenant
- **THEN** the system responds with HTTP 404

#### Scenario: Closing an already closed session
- **WHEN** a user attempts to close a cash session that is already closed
- **THEN** the system responds with HTTP 409 and no changes are made

#### Scenario: Rejecting negative closing amounts
- **WHEN** a `cashier` provides a negative closing amount for any method
- **THEN** the system responds with HTTP 400 and the session stays open

### Requirement: Reopen a closed branch
The system SHALL allow opening a new cash session for a branch once its previous session is closed.

#### Scenario: Opening after closing
- **WHEN** a `cashier` opens a cash session for a branch whose previous session is closed
- **THEN** the system responds with HTTP 201 and a new open session is created