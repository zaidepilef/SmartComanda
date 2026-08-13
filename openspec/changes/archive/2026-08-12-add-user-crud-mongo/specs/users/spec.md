## Purpose

Provides a complete CRUD API for the user entity backed by MongoDB, with versioned schema migrations run at backend startup and password security by design.

## ADDED Requirements

### Requirement: User entity persisted in MongoDB
The system SHALL persist users in a `users` collection in MongoDB with the following fields: `firstName`, `lastName`, `email`, `passwordHash`, `status` (active/inactive), `createdAt`, and `updatedAt`.

#### Scenario: Creating a user persists all fields
- **WHEN** a valid user is created through the API
- **THEN** the user is stored in the `users` collection with all required fields populated.

#### Scenario: Email is unique
- **WHEN** a user is created or updated with an email that already belongs to another user
- **THEN** the operation fails with a conflict error and no duplicate email is stored.

### Requirement: CRUD API for users
The system SHALL expose REST endpoints under `/api/users` to create, read, update, delete, and list users.

#### Scenario: Creating a user
- **WHEN** a client POSTs a valid user payload to `/api/users`
- **THEN** the API creates the user and responds with HTTP 201 and the created user without the password hash.

#### Scenario: Reading a user
- **WHEN** a client GETs `/api/users/:id` with an existing user id
- **THEN** the API responds with HTTP 200 and the user without the password hash.

#### Scenario: Reading a nonexistent user
- **WHEN** a client GETs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Updating a user
- **WHEN** a client PUTs a valid payload to `/api/users/:id` for an existing user
- **THEN** the API updates the user, returns HTTP 200 with the updated user without the password hash, and refreshes `updatedAt`.

#### Scenario: Deleting a user
- **WHEN** a client DELETEs `/api/users/:id` with an existing user id
- **THEN** the API removes the user and responds with HTTP 204.

#### Scenario: Deleting a nonexistent user
- **WHEN** a client DELETEs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

### Requirement: User listing with pagination
The system SHALL support listing users with pagination via `page` and `limit` query parameters, returning the requested page plus total count.

#### Scenario: Listing users with pagination
- **WHEN** a client GETs `/api/users?page=1&limit=10`
- **THEN** the API responds with HTTP 200 containing up to `limit` users without password hashes, the current page, the total number of users, and the total number of pages.

#### Scenario: Filtering by status
- **WHEN** a client GETs `/api/users?status=active`
- **THEN** the API responds only with users whose status matches the filter.

### Requirement: Password security
The system SHALL hash passwords before storing them and SHALL NOT return the password hash in any API response.

#### Scenario: Password is hashed on creation
- **WHEN** a user is created with a plaintext password
- **THEN** the stored record contains a hashed password and never the plaintext.

#### Scenario: Password is never exposed
- **WHEN** any endpoint returns a user
- **THEN** the response body never contains the `passwordHash` field.

#### Scenario: Updating a password re-hashes it
- **WHEN** a user's password is updated through the API
- **THEN** the new password is hashed before being stored and the previous hash is replaced.

### Requirement: Input validation
The system SHALL validate user input and reject malformed payloads with HTTP 400 and a descriptive error.

#### Scenario: Rejecting invalid payloads
- **WHEN** a client submits a user payload with a missing required field or an invalid email
- **THEN** the API responds with HTTP 400 and a descriptive error and no user is created or modified.

### Requirement: Versioned schema migrations
The system SHALL run versioned MongoDB migrations at backend startup, applying pending migrations in order and tracking applied ones in a `migrations` collection.

#### Scenario: Applying pending migrations on startup
- **WHEN** the backend starts and the database contains migrations not yet applied
- **THEN** those migrations are applied in version order before the API begins serving requests.

#### Scenario: Not re-applying applied migrations
- **WHEN** the backend starts and all registered migrations are already recorded in the `migrations` collection
- **THEN** no migration is re-executed.

#### Scenario: Failing startup on migration error
- **WHEN** a migration fails during startup
- **THEN** the backend logs the error and exits without serving requests.

#### Scenario: Ensuring the email unique index
- **WHEN** migrations have run on an empty database
- **THEN** a unique index exists on the `users.email` field and an index exists on the `users.status` field.
