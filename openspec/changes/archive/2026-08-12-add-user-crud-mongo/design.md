## Context

The backend is a minimal Express 5 + MongoDB driver app (`backend/src/server.js`, `db/mongo.js`, `config/env.js`, `routes/health.js`). MongoDB connectivity, Docker service, and env-driven `MONGODB_URI` already exist (see `openspec/specs/mongodb-infrastructure`). There is no domain layer yet: no models, repositories, services, controllers, or migrations. The project guidelines (AGENTS.md) prescribe a layered structure under `backend/src`: controllers, services, repositories, models, routes, middleware, config, utils.

## Goals / Non-Goals

**Goals:**
- Establish the layered architecture pattern in the backend that future entities will follow.
- CRUD REST API for users with pagination, input validation, and password hashing.
- Versioned migration runner for MongoDB executed at startup.

**Non-Goals:**
- Authentication / authorization (login, JWT, roles) - future change.
- Password reset flows.
- Deleting a user's data from related collections (users have no relations yet).
- Postgres usage for users - MongoDB is the designated store for this entity.

## Decisions

**1. Layered architecture: routes → controllers → services → repositories → models**
Matching AGENTS.md. Routes parse HTTP concerns, controllers translate requests into service calls and build responses, services hold business rules (hashing, pagination), repositories encapsulate MongoDB queries, models define the collection/document helpers. Future entities copy this pattern.
*Alternatives:* Mongoose ODM - rejected to keep the stack thin with the already-installed official driver, consistent with existing `db/mongo.js`; an ODM can be adopted later without API changes.

**2. Password hashing with `bcryptjs`**
Pure-JS bcrypt avoids native compilation issues in Docker Alpine builds. Cost factor 10. Hash computed in the service layer on create and password update.
*Alternatives:* `argon2` (stronger but native build complexity), Node `crypto.scrypt` (built-in, viable, but bcryptjs is the conventional choice and easier to review).

**3. Input validation with `zod`**
Schemas defined per operation (`createUserSchema`, `updateUserSchema`, `querySchema`), applied at the route level via validation middleware. Rejects malformed payloads with 400.
*Alternatives:* `joi`, `express-validator` - zod was chosen for TypeScript-style inference and composability; all equivalent in capability here.

**4. Unique email enforced by MongoDB unique index, not application checks**
The migration creates a unique index on `users.email`. On duplicate-key error (error code 11000) the repository maps it to a 409 conflict. Avoids race conditions of check-then-insert.
*Alternatives:* application-level pre-check - rejected due to TOCTOU race.

**5. Custom lightweight migration runner (no library)**
A `migrations/` folder with numbered files (`001_create_users.js`), a `runMigrations()` function in `db/migrations.js` that creates the `migrations` collection, records applied versions, and applies pending ones in order inside the startup sequence before `app.listen`. Simple, dependency-free, fits the existing thin-stack approach.
*Alternatives:* `migrate-mongo` library - adds a dependency and CLI conventions; the custom runner is ~60 lines and satisfies the spec (order, dedupe, fail-fast).

**6. Sanitized responses via `toPublicUser()` model helper**
Central `toPublicUser` that strips `passwordHash`. Used by repository/service when returning users, so no endpoint can leak it.
*Alternatives:* middleware-level field exclusion per route - more error-prone; single helper guarantees consistency.

**7. Response envelope for listing**
`GET /api/users` returns `{ data, pagination: { page, limit, total, totalPages } }` - explicit, testable, and matches the spec scenarios.

**8. API versioning**
Routes mounted at `/api/users` (no `/v1` yet). Versioning can be introduced later; premature now.

## API Contract (Request/Response)

Base URL: `http://localhost:3000` (configurable via `PORT`). All requests and responses use `Content-Type: application/json`.

User JSON shape (public, `passwordHash` never present): `{ _id, firstName, lastName, email, status, createdAt, updatedAt }`.

Error shape: `{ error: string, details?: [{ path, message }] }` (details only on validation failures).

### POST /api/users
Creates a user. Body: `{ firstName, lastName, email, password, status? }` (password min 8 chars).
- `201` → `{ "_id": "6a7cf7ca0c18f5954940261a", "firstName": "Ana", "lastName": "Gomez", "email": "ana@test.com", "status": "active", "createdAt": "2026-08-12T22:46:34.360Z", "updatedAt": "2026-08-12T22:46:34.360Z" }`
- `400` → `{ "error": "Invalid payload.", "details": [{ "path": "email", "message": "A valid email is required." }] }`
- `409` → `{ "error": "A user with this email already exists." }`

### GET /api/users/:id
- `200` → public user JSON (as above)
- `404` → `{ "error": "User not found." }`

### PUT /api/users/:id
Updates one or more fields. Body: any subset of `{ firstName, lastName, email, password, status }` (at least one required); `updatedAt` is refreshed automatically; `password` is re-hashed.
- `200` → updated public user JSON
- `400` / `404` / `409` → as above

### DELETE /api/users/:id
- `204` → empty body
- `404` → `{ "error": "User not found." }`

### GET /api/users?page=1&limit=10&status=active
Lists users with pagination (`page` ≥ 1, `limit` 1–100, `status` ∈ active|inactive, all optional).
- `200` → `{ "data": [<public user>], "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }`
- `400` → validation error for bad query params

## Risks / Trade-offs

- [Migration runs before server listens; a failed migration blocks startup] → Runner executes before `app.listen` and exits with a clear log, per spec.
- [Custom migration runner lacks library features (down migrations)] → Rollback handled by restoring from the mongodump backups already provided by the mongodb-infrastructure capability; migrations are append-only.
- [bcryptjs is slower than native implementations] → Acceptable for admin panel volume; cost factor 10 is a sane default.
- [Deleting a user with future dependent data (orders, roles)] → Currently no relations exist; future changes will handle referential integrity when those entities land.
- [Unique index creation on a collection with existing duplicates would fail startup] → Fresh `users` collection today; documented as a migration concern for the future.

## Migration Plan

1. Add `users` and `migrations` collections through the migration runner at startup - no manual DDL needed.
2. Deploy by restarting the backend; migrations apply before serving.
3. Rollback: restore the database from a mongodump archive (existing backup scripts) and revert the code deploy; migrations are recorded as applied, so a restore is the only consistent way back.

## Open Questions

None.
