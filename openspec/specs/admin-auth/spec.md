# admin-auth Specification

## Purpose

Provides the frontend authentication flow for the admin panel: login and registration pages, JWT storage, route protection, and authenticated API access.

## Requirements

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

### Requirement: Token storage
The system SHALL persist the JWT locally so the user stays authenticated across page reloads, and SHALL remove it on logout.

#### Scenario: Reload keeps session
- **WHEN** a user with a stored JWT reloads the application
- **THEN** the system considers them authenticated.

#### Scenario: Missing token
- **WHEN** no JWT is stored locally
- **THEN** the system treats the user as unauthenticated.

### Requirement: Route protection
The system SHALL protect all layout routes with a guard that allows access only to authenticated users.

#### Scenario: Unauthenticated user accesses a protected route
- **WHEN** an unauthenticated user navigates to any route inside the main layout
- **THEN** the system redirects them to `/login`.

#### Scenario: Authenticated user accesses a protected route
- **WHEN** an authenticated user navigates to any route inside the main layout
- **THEN** the system allows access to the route.

### Requirement: Authenticated API access
The system SHALL attach the stored JWT as a Bearer token to every outgoing API request.

#### Scenario: Authenticated request carries the token
- **WHEN** the application sends an API request while a JWT is stored
- **THEN** the request includes an `Authorization: Bearer <token>` header.

#### Scenario: API rejects the token
- **WHEN** the API responds with HTTP 401 to a request carrying the stored token
- **THEN** the system removes the token and redirects the user to `/login`.

### Requirement: Current user display and logout
The system SHALL load the profile of the authenticated user after login and SHALL provide a logout action.

#### Scenario: Dashboard shows the user profile
- **WHEN** an authenticated user lands on `/dashboard`
- **THEN** the system loads the user profile from the current-user endpoint and displays it.

#### Scenario: Logout
- **WHEN** an authenticated user triggers logout
- **THEN** the system calls the logout endpoint, removes the stored JWT, and redirects to `/login`.
