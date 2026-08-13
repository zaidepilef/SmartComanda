# registration-verification Specification

## Purpose

Defines the pending-approval lifecycle for publicly registered accounts: new accounts stay locked until an authenticated panel user approves or rejects them.

## Requirements

### Requirement: Pending accounts are locked until approved
The system SHALL keep users created through public registration in a `pending` state that blocks login until an authenticated panel user approves them.

#### Scenario: Pending account cannot log in
- **WHEN** a user with `pending` status attempts to log in with valid credentials
- **THEN** the API responds with HTTP 403 and a message indicating the account awaits verification.

#### Scenario: Approved account can log in
- **WHEN** an authenticated panel user changes a pending account's status to `active`
- **THEN** the account owner can log in with their credentials.

#### Scenario: Rejected account cannot log in
- **WHEN** an authenticated panel user changes a pending account's status to `inactive`
- **THEN** the account owner receives HTTP 403 on login.

### Requirement: Account approval and rejection by panel users
The system SHALL allow any authenticated panel user to approve or reject pending accounts, and SHALL allow reactivating rejected accounts.

#### Scenario: Approving a pending account
- **WHEN** an authenticated user changes a pending account's status to `active`
- **THEN** the system stores the account as `active` and the change is visible in user listings.

#### Scenario: Rejecting a pending account
- **WHEN** an authenticated user changes a pending account's status to `inactive`
- **THEN** the system stores the account as `inactive` and the change is visible in user listings.

#### Scenario: Reactivating a rejected account
- **WHEN** an authenticated user changes an `inactive` account's status to `active`
- **THEN** the account owner can log in again with their credentials.

#### Scenario: Rejected email remains unavailable for re-registration
- **WHEN** a rejected (or any existing) user attempts to register again with the same email
- **THEN** the API responds with HTTP 409 and no duplicate account is created.

### Requirement: Registration success communicates pending verification
The system SHALL inform the user after successful registration that their account awaits internal verification before they can log in.

#### Scenario: Success message after registration
- **WHEN** a user completes registration successfully
- **THEN** the registration page shows a message indicating the account awaits verification and does not redirect to a usable session.