## MODIFIED Requirements

### Requirement: CRUD API for users
The system SHALL expose REST endpoints under `/api/users` to create, read, update, delete, and list users. All `/api/users` endpoints SHALL require a valid Bearer token issued by the authentication system.

#### Scenario: Creating a user
- **WHEN** an authenticated client POSTs a valid user payload to `/api/users`
- **THEN** the API creates the user and responds with HTTP 201 and the created user without the password hash.

#### Scenario: Reading a user
- **WHEN** an authenticated client GETs `/api/users/:id` with an existing user id
- **THEN** the API responds with HTTP 200 and the user without the password hash.

#### Scenario: Reading a nonexistent user
- **WHEN** an authenticated client GETs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Updating a user
- **WHEN** an authenticated client PUTs a valid payload to `/api/users/:id` for an existing user
- **THEN** the API updates the user, returns HTTP 200 with the updated user without the password hash, and refreshes `updatedAt`.

#### Scenario: Deleting a user
- **WHEN** an authenticated client DELETEs `/api/users/:id` with an existing user id
- **THEN** the API removes the user and responds with HTTP 204.

#### Scenario: Deleting a nonexistent user
- **WHEN** an authenticated client DELETEs `/api/users/:id` with a non-existent user id
- **THEN** the API responds with HTTP 404 and an error message.

#### Scenario: Listing users with pagination
- **WHEN** an authenticated client GETs `/api/users?page=1&limit=10`
- **THEN** the API responds with HTTP 200 containing up to `limit` users without password hashes, the current page, the total number of users, and the total number of pages.

#### Scenario: Filtering by status
- **WHEN** an authenticated client GETs `/api/users?status=active`
- **THEN** the API responds only with users whose status matches the filter.

#### Scenario: Unauthenticated user CRUD request
- **WHEN** a client requests any `/api/users` endpoint without a valid Bearer token
- **THEN** the API responds with HTTP 401 and no user data is returned.
