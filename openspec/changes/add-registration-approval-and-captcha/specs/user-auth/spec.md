## MODIFIED Requirements

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