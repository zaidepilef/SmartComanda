## MODIFIED Requirements

### Requirement: Login with email and password
The system SHALL provide a login endpoint that verifies a user's email and password against the stored credentials and issues a signed JWT on success. The JWT SHALL include the user's `roles` (a non-empty array of role names) and `tenantId` (absent when the user has no tenant) as claims, so clients can build role- and tenant-aware interfaces without extra requests. Token claims SHALL be informational only: the API SHALL continue to authorize requests against the user record loaded from the database on every request, never against token claims. A user whose stored credentials are missing or unusable (e.g. a `passwordHash` that is null or not a bcrypt hash) SHALL be treated as having invalid credentials: the API SHALL respond with HTTP 401 and the generic login error rather than failing with an internal error.

#### Scenario: Successful login
- **WHEN** a client POSTs valid credentials (email + password) to the login endpoint
- **THEN** the API responds with HTTP 200, a signed JWT access token carrying `roles` and `tenantId` claims, its expiration time, and the public user profile without the password hash.

#### Scenario: Login token claims match the stored user
- **WHEN** the API issues a JWT for a user with `roles: ["admin"]` and a `tenantId`
- **THEN** the token's `roles` and `tenantId` claims match the stored user record, and the claims are used only for client-side convenience, never for authorization decisions.

#### Scenario: Wrong credentials
- **WHEN** a client POSTs an unknown email or a wrong password to the login endpoint
- **THEN** the API responds with HTTP 401 and a generic error message that does not reveal whether the email exists.

#### Scenario: User with no stored password cannot log in
- **WHEN** a client POSTs credentials for a user whose stored `passwordHash` is null or not a valid bcrypt hash
- **THEN** the API responds with HTTP 401 and the generic login error, without crashing or exposing the missing credential state.

#### Scenario: Inactive user cannot log in
- **WHEN** a client POSTs valid credentials for a user whose status is not active
- **THEN** the API responds with HTTP 403 and no token is issued.

#### Scenario: Pending user cannot log in
- **WHEN** a client POSTs valid credentials for a user whose status is `pending`
- **THEN** the API responds with HTTP 403, a message indicating the account awaits verification, and no token is issued.