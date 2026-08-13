## MODIFIED Requirements

### Requirement: Login page
The system SHALL provide a login page at `/login`, outside the main layout, that authenticates against the backend login endpoint and stores the returned JWT locally.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials (email and password) on the login page
- **THEN** the system stores the returned JWT locally and redirects to `/dashboard`.

#### Scenario: Failed login
- **WHEN** a user submits unknown credentials on the login page
- **THEN** the system shows a localized Spanish error message for invalid credentials, indicating the password is wrong or the email is not registered, and does not store any token.

#### Scenario: Pending account login attempt
- **WHEN** a user with a pending-verification account submits correct credentials on the login page
- **THEN** the system shows a localized Spanish message indicating the account awaits internal verification and does not store any token.

#### Scenario: Blocked account login attempt
- **WHEN** a user with an inactive (blocked) account submits correct credentials on the login page
- **THEN** the system shows a localized Spanish message indicating the account is blocked and does not store any token.

#### Scenario: Authenticated user visits the login page
- **WHEN** an already authenticated user navigates to `/login`
- **THEN** the system redirects them to `/dashboard`.

### Requirement: Registration page
The system SHALL provide a registration page at `/register`, outside the main layout, that creates a new user through the backend registration endpoint, requiring a password confirmation field and a Turnstile anti-bot check.

#### Scenario: Successful registration
- **WHEN** a user submits a valid registration payload (with matching passwords and a solved Turnstile widget) on the registration page
- **THEN** the system creates the account with `pending` status and shows a message indicating the account awaits internal verification.

#### Scenario: Duplicate email
- **WHEN** a user submits a registration payload whose email already exists
- **THEN** the system shows a localized Spanish error message and stays on the registration page.

#### Scenario: Invalid registration payload
- **WHEN** a user submits a registration payload with missing, invalid, or weak fields
- **THEN** the system shows a localized Spanish error message and stays on the registration page.

#### Scenario: Passwords do not match
- **WHEN** a user submits a registration payload whose password confirmation differs from the password
- **THEN** the form shows a validation error, no request is sent to the backend, and the submission is blocked.

#### Scenario: Turnstile not solved
- **WHEN** a user submits the registration form without completing the Turnstile widget
- **THEN** the form blocks submission until the widget is solved.

#### Scenario: Turnstile rejected by backend
- **WHEN** the backend rejects the submitted Turnstile token
- **THEN** the system shows a localized Spanish error message, resets the Turnstile widget, and stays on the registration page.