## Purpose

Lets a sysadmin or a tenant admin reset the login password of another user from the admin panel through a dedicated, confirmed action, backed by PostgreSQL and the existing tenant-scoped authorization rules.

## ADDED Requirements

### Requirement: Reset a user's password
The system SHALL provide an authenticated endpoint to reset another user's password to a new value provided by the caller, requiring the caller and target permissions per the existing `canManageUser` rule: a `sysadmin` may reset any user, and an `admin` may reset only users of their own tenant (never another sysadmin). The new password SHALL meet the same minimum strength rules as user creation (at least 8 characters) and SHALL be stored hashed in PostgreSQL.

#### Scenario: Sysadmin resets any user's password
- **WHEN** an authenticated `sysadmin` resets the password of a user with a new value meeting the minimum strength
- **THEN** the API responds with HTTP 200, the user's `passwordHash` is updated to a bcrypt hash of the new value, and the response excludes the password hash.

#### Scenario: Admin resets a user of its own tenant
- **WHEN** an authenticated `admin` resets the password of a user whose `tenantId` matches the admin's own tenant
- **THEN** the API responds with HTTP 200 and the password is updated.

#### Scenario: Target user belongs to another tenant
- **WHEN** an authenticated `admin` attempts to reset the password of a user whose `tenantId` differs from the admin's own tenant
- **THEN** the API responds with HTTP 403 and no password is changed.

#### Scenario: Non-privileged role cannot reset passwords
- **WHEN** a user whose roles are neither `sysadmin` nor `admin` attempts to reset another user's password
- **THEN** the API responds with HTTP 403 and no password is changed.

#### Scenario: Resetting the password of a sysadmin user
- **WHEN** a non-sysadmin caller attempts to reset the password of a user holding the `sysadmin` role
- **THEN** the API responds with HTTP 403 and no password is changed.

#### Scenario: Weak new password is rejected
- **WHEN** a caller attempts to reset a password with fewer than 8 characters
- **THEN** the API responds with HTTP 400 and no password is changed.

#### Scenario: Resetting a user that does not exist
- **WHEN** a caller attempts to reset the password of a user id that does not exist
- **THEN** the API responds with HTTP 404 and no password is changed.

#### Scenario: Reset is a dedicated action, separate from profile editing
- **WHEN** the panel resets a user's password through the reset action
- **THEN** the reset uses the dedicated reset operation and only the password is changed (profile fields such as firstName, lastName, email, and status are left untouched).

### Requirement: Reset password UI in the admin panel
The system SHALL expose a dedicated "Resetear contraseña" action per user row in the admin users view that opens a confirmation dialog requiring the new password before the reset is sent.

#### Scenario: Opening the reset dialog
- **WHEN** a manager clicks "Resetear contraseña" on a user row
- **THEN** a confirmation dialog opens with a password input field and explicit confirm/cancel actions.

#### Scenario: Confirming a reset
- **WHEN** the manager enters a valid new password and confirms
- **THEN** the panel calls the reset endpoint and refreshes the user list.

#### Scenario: Cancelling a reset
- **WHEN** the manager cancels the dialog without confirming
- **THEN** no request is sent and no password is changed.

#### Scenario: Reset success feedback
- **WHEN** the reset succeeds
- **THEN** the panel shows a success message and the user's data is reloaded.