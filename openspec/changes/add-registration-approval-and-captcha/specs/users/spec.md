## MODIFIED Requirements

### Requirement: User entity persisted in MongoDB
The system SHALL persist users in a `users` collection in MongoDB with the following fields: `firstName`, `lastName`, `email`, `passwordHash`, `status` (active/inactive/pending), `createdAt`, and `updatedAt`.

#### Scenario: Creating a user persists all fields
- **WHEN** a valid user is created through the API
- **THEN** the user is stored in the `users` collection with all required fields populated.

#### Scenario: Email is unique
- **WHEN** a user is created or updated with an email that already belongs to another user
- **THEN** the operation fails with a conflict error and no duplicate email is stored.

#### Scenario: Public registration creates a pending user
- **WHEN** a user is created through the public registration endpoint
- **THEN** the user is stored with `pending` status.

#### Scenario: Listing users by pending status
- **WHEN** an authenticated client GETs `/api/users?status=pending`
- **THEN** the API responds only with users whose status is `pending`.