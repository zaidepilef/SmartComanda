## Why

The backend currently only exposes a health check: there is no domain model to persist or manage data. The user entity is the foundation of SmartComanda (authentication, roles, and operators depend on it), so it must exist with a complete CRUD API and a migration mechanism to manage MongoDB schema evolution safely over time.

## What Changes

- Add a `users` collection managed by MongoDB with a versioned migration mechanism (MongoDB-style migrations, since the database has no native schema migrations like Postgres).
- Add CRUD REST endpoints for the user entity (create, read, update, delete, list with pagination) under `/api/users`.
- Add password hashing (never storing plaintext passwords) and sanitized responses (never exposing the password hash).
- Add unique constraints (e.g., email) via MongoDB indexes, including a unique index on `email`.
- Add a `status` field to support active/inactive users.
- Exclude the user password hash from all API responses.
- Migration runner executed at backend startup, with each migration tracked in a `migrations` collection.

## Capabilities

### New Capabilities
- `users`: CRUD API for the user entity backed by MongoDB, including entity shape, unique indexes, pagination, and a schema migration runner that applies versioned migrations at startup.

### Modified Capabilities
<!-- None. The existing mongodb-infrastructure capability is not behaviorally changed; migrations and users are new behavior. -->

## Impact

- **Backend**: `backend/src` gains `models/`, `repositories/`, `services/`, `controllers/`, `routes/`, and `migrations/` layers per the project's layered architecture.
- **Database**: new `users` and `migrations` collections inside the existing MongoDB database (`smartcomanda`); no schema change is required for the existing Postgres database.
- **Dependencies**: new npm packages for password hashing (e.g., `bcryptjs`) and input validation (e.g., `zod`) if adopted in the design.
- **API surface**: new `/api/users` endpoints; no existing endpoint is modified.
