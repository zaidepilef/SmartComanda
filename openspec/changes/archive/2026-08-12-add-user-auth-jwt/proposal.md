## Why

SmartComanda needs authenticated access to its API: users are created (see `add-user-crud-mongo`), but nothing verifies who they are. A JWT-based authentication system on the user domain secures all management endpoints and is the prerequisite for role-based authorization and the admin panel.

## What Changes

- Add `POST /api/auth/login` that verifies email + password against the users collection (bcrypt) and issues a signed JWT.
- Add `POST /api/auth/register` to create a user via the existing user service (only for active users).
- Add `GET /api/auth/me` that returns the authenticated user's public profile.
- Add an `authRequired` middleware that validates the `Authorization: Bearer <token>` header, rejects invalid/expired tokens with 401, and attaches the authenticated user to the request.
- Add a `JWT_SECRET` environment variable (never hardcoded, never committed) and token expiration configured by env.
- Only users with `status: active` can log in; inactive users are rejected with 403.
- Login failures return a generic error (no user enumeration).
- Protect the existing user CRUD routes (`/api/users`) with the auth middleware, except when the change defines the sequence in tasks.

## Capabilities

### New Capabilities
- `user-auth`: Authentication API for the user domain: login with JWT issuance, registration, current-user retrieval, and a Bearer-token middleware that protects API routes.

### Modified Capabilities
- `users`: `POST /api/users` creation is not modified, but the CRUD endpoints become protected by the authentication middleware (requires the `users` capability to be applied first).

## Impact

- **Backend**: new `auth` routes/controllers/services, JWT middleware under `backend/src/middleware`, env additions in `backend/src/config/env.js`, and `.env.example` updated with `JWT_SECRET` and token expiry placeholders.
- **Dependencies**: `jsonwebtoken` npm package added to `backend/package.json`.
- **API surface**: new `/api/auth/*` endpoints; `/api/users` endpoints become authenticated (protected) - behavior change once middleware is applied.
- **Prerequisite**: depends on the user entity (email, passwordHash, status) from `add-user-crud-mongo`; that change must be implemented first.
