# user-auth Specification

## Purpose

Provides JWT-based authentication for the SmartComanda user domain: login, registration, current-user retrieval, and route protection via a Bearer-token middleware.

## Requirements

### Requirement: Login with email and password
The system SHALL provide a login endpoint that verifies a user's email and password against the stored credentials and issues a signed JWT on success.

#### Scenario: Successful login
- **WHEN** a client POSTs valid credentials (email + password) to the login endpoint
- **THEN** the API responds with HTTP 200, a signed JWT access token, its expiration time, and the public user profile without the password hash.

#### Scenario: Wrong credentials
- **WHEN** a client POSTs an unknown email or a wrong password to the login endpoint
- **THEN** the API responds with HTTP 401 and a generic error message that does not reveal whether the email exists.

#### Scenario: Inactive user cannot log in
- **WHEN** a client POSTs valid credentials for a user whose status is not active
- **THEN** the API responds with HTTP 403 and no token is issued.

#### Scenario: Pending user cannot log in
- **WHEN** a client POSTs valid credentials for a user whose status is `pending`
- **THEN** the API responds with HTTP 403, a message indicating the account awaits verification, and no token is issued.

### Requirement: Registration endpoint
The system SHALL provide a registration endpoint that creates a new user through the existing user service, protected by a Turnstile anti-bot check.

#### Scenario: Registering a new user
- **WHEN** a client POSTs a valid registration payload (name, email, password, Turnstile token) to the registration endpoint
- **THEN** the API verifies the Turnstile token with the provider, creates the user with a hashed password and `pending` status, and responds with HTTP 201 and the public user profile without the password hash.

#### Scenario: Missing or invalid Turnstile token
- **WHEN** a client POSTs a registration payload without a Turnstile token or with an invalid token
- **THEN** the API responds with HTTP 400 and no user is created.

#### Scenario: Duplicate email on registration
- **WHEN** a client POSTs a registration payload whose email already belongs to another user
- **THEN** the API responds with HTTP 409 and no user is created.

#### Scenario: Invalid registration payload
- **WHEN** a client POSTs a registration payload with a missing field or an invalid email or a weak password
- **THEN** the API responds with HTTP 400 with a descriptive error and no user is created.

### Requirement: Current user endpoint
The system SHALL provide an authenticated endpoint that returns the profile of the user making the request.

#### Scenario: Retrieving the authenticated user
- **WHEN** an authenticated client GETs the current-user endpoint with a valid Bearer token
- **THEN** the API responds with HTTP 200 and the public profile of the token's user without the password hash.

#### Scenario: Unauthenticated current-user request
- **WHEN** a client GETs the current-user endpoint without a token or with an invalid token
- **THEN** the API responds with HTTP 401 and no user data.

### Requirement: Bearer token authentication middleware
The system SHALL protect API routes with middleware that requires a valid `Authorization: Bearer <token>` header and attaches the authenticated user to the request, and SHALL reject tokens that have been revoked via logout.

#### Scenario: Accessing a protected route with a valid token
- **WHEN** a client requests a protected route with a valid, unexpired Bearer token that has not been revoked
- **THEN** the request proceeds and the route can identify the authenticated user.

#### Scenario: Missing token
- **WHEN** a client requests a protected route without an Authorization header
- **THEN** the API responds with HTTP 401.

#### Scenario: Invalid or expired token
- **WHEN** a client requests a protected route with a malformed, tampered, or expired token
- **THEN** the API responds with HTTP 401 and no protected data is returned.

#### Scenario: Revoked token
- **WHEN** a client requests a protected route with a valid token that was previously revoked by a logout
- **THEN** the API responds with HTTP 401 and no protected data is returned.

#### Scenario: Non-Bearer scheme
- **WHEN** a client requests a protected route with an Authorization header that does not use the Bearer scheme
- **THEN** the API responds with HTTP 401.

### Requirement: Logout endpoint
The system SHALL provide an authenticated logout endpoint that revokes the presented token so it can no longer access protected routes.

#### Scenario: Logging out with a valid token
- **WHEN** an authenticated client POSTs to the logout endpoint with a valid Bearer token
- **THEN** the API revokes the token and responds with HTTP 204.

#### Scenario: Logging out without a token
- **WHEN** a client POSTs to the logout endpoint without a token or with an invalid token
- **THEN** the API responds with HTTP 401 and no token is revoked.

### Requirement: Token configuration via environment
The system SHALL configure the JWT signing secret and token expiration exclusively through environment variables, never hardcoded in source code.

#### Scenario: JWT secret from environment
- **WHEN** the backend starts with a configured `JWT_SECRET` and token expiration
- **THEN** issued tokens are signed with that secret and expire after the configured duration.

#### Scenario: Missing JWT secret
- **WHEN** the backend starts without a `JWT_SECRET` configured
- **THEN** the backend refuses to start and logs a clear error, rather than running with an insecure default secret.