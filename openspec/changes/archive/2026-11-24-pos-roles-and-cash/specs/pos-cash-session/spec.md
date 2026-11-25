## MODIFIED Requirements

### Requirement: Open cash session
The system SHALL allow `cashier`, `admin`, `owner`, and `sysadmin` users to open a cash session for a branch of their tenant with an opening amount (zero or greater), SHALL reject the action for `cook` users with HTTP 403, SHALL reject opening a second session while one is already open for the same branch with HTTP 409, and SHALL record the user who opened it and the timestamp.

#### Scenario: Opening a session with an opening amount
- **WHEN** a `cashier` opens a cash session for a branch with an opening amount of 50000
- **THEN** the session is stored as open with the opening amount, the opener, and the timestamp

#### Scenario: Rejecting a second open session
- **WHEN** a user tries to open a session for a branch that already has an open one
- **THEN** the system responds with HTTP 409 and the POS shows the session that is already open

#### Scenario: Rejecting a negative opening amount
- **WHEN** a user opens a session with a negative opening amount
- **THEN** the system rejects the request with an error

#### Scenario: Cook cannot open a session
- **WHEN** a `cook` attempts to open a cash session
- **THEN** the system responds with HTTP 403

### Requirement: View current session
The POS SHALL show the branch's open cash session — opening date and time, who opened it, opening amount, totals per payment method, expected cash in the drawer (opening amount plus cash sales), and order count — and SHALL show an open prompt when the branch has none. A session opened on a previous day SHALL be shown with a warning so it can be closed. Sessions SHALL be scoped to their branch.

#### Scenario: Viewing the open session
- **WHEN** the branch has an open session
- **THEN** the screen shows the opening date, the opener, the opening amount, the totals per method, the expected cash, and the order count

#### Scenario: Session left open from a previous day
- **WHEN** the branch's open session was opened before today
- **THEN** the screen shows it with a warning "Caja abierta desde <fecha>" and the close action

#### Scenario: Showing the open prompt
- **WHEN** the branch has no open session
- **THEN** the screen shows the prompt to open one

#### Scenario: Sessions are branch-scoped
- **WHEN** two branches have sessions open
- **THEN** each branch's screen shows only its own session

## REMOVED Requirements

### Requirement: Cash session closure is deferred
**Reason**: Closing is already implemented and specified by the `cash-session-closure` capability; this requirement is obsolete and contradicts it.
**Migration**: None. Clients use `POST /api/cash-sessions/:id/close` as specified in `cash-session-closure`.
