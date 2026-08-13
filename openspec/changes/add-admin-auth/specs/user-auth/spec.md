## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Logout endpoint
The system SHALL provide an authenticated logout endpoint that revokes the presented token so it can no longer access protected routes.

#### Scenario: Logging out with a valid token
- **WHEN** an authenticated client POSTs to the logout endpoint with a valid Bearer token
- **THEN** the API revokes the token and responds with HTTP 204.

#### Scenario: Logging out without a token
- **WHEN** a client POSTs to the logout endpoint without a token or with an invalid token
- **THEN** the API responds with HTTP 401 and no token is revoked.