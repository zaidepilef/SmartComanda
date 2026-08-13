## Context

The backend is a thin Express 5 + MongoDB app whose domain layer is being established by `add-user-crud-mongo` (users collection with `passwordHash` via bcryptjs, layered architecture routes → controllers → services → repositories, zod validation, `toPublicUser()` sanitizer). This change adds JWT authentication on top of that user domain. See `add-user-crud-mongo/design.md` for the base architecture.

## Goals / Non-Goals

**Goals:**
- Stateless JWT authentication (access token only) for the user domain API.
- Protect user CRUD and future routes via a reusable middleware.
- Fail-safe startup when `JWT_SECRET` is missing.

**Non-Goals:**
- Refresh tokens / token rotation - single short-lived access token; re-login on expiry (can be added later without breaking changes).
- Role-based authorization (RBAC) - roles don't exist in the user entity yet; the middleware only proves identity, not authorization.
- Password reset / forgot password flows.
- Session revocation / token blacklist - stateless tokens; disabling a user prevents new logins but does not invalidate already-issued tokens until expiry.

## Decisions

**1. JWT with `jsonwebtoken`, HS256, single access token**
`jsonwebtoken` is the de facto standard, pure JS, no native deps (Docker-safe). HS256 with a secret (not asymmetric keys) - fine for a single backend service.
*Alternatives:* `jose` (modern, no deps, same capability), asymmetric RS256 (overkill for one service; adds key management).

**2. Token payload: `sub` (user id) + `email` + `status`, 1h default expiry**
Minimal claims reduce token size; user profile data is always fetched fresh from the database in the middleware (`findById`), so the token never carries stale profile data. `exp` set via `expiresIn` env (`JWT_EXPIRES_IN`, default `1h`).
*Alternatives:* embedding full user profile in the token - rejected: stale data risk and bigger tokens.

**3. Middleware resolves the user from the database on every request**
`authRequired` verifies the Bearer token signature/expiry, then loads the user from Mongo. A deleted or inactive user (including one disabled after token issuance) is rejected with 401, enforcing freshness beyond the token itself.
*Alternatives:* trusting token claims only - rejected: cannot detect disabled/deleted users until expiry.

**4. Login failure behavior: always 401 with a generic message**
Same response for unknown email and wrong password ("Invalid credentials"), preventing user enumeration. Timing difference between the two paths is negligible here and noted as accepted.
*Alternatives:* distinct messages - rejected (user enumeration).

**5. Registration reuses the existing user service**
`POST /api/auth/register` delegates to `userService.createUser` from `add-user-crud-mongo`; no duplicate business logic. A shared `auth` service adds login (`findByEmail` + `bcrypt.compare`) and token issuance.
*Alternatives:* a separate registration path - rejected (DRY).

**6. `JWT_SECRET` required at startup; `.env.example` documents placeholders**
`env.js` fails fast (clear log + exit) when `JWT_SECRET` is missing or shorter than 32 chars. Never committed to the repo.
*Alternatives:* default dev secret - rejected: silent insecure default.

**7. Route protection order**
`/api/users` mounts `authRequired` at the router level. `/health` stays public. New protected routers follow the same pattern.

## Risks / Trade-offs

- [Stateless tokens can't be revoked instantly] → Short expiry (default 1h), and middleware re-checks user status/deletion from the DB on each request; full revocation (blacklist) deferred as non-goal.
- [Secret management] → Fail-fast startup without a strong `JWT_SECRET`; documented in `.env.example`; rotate by changing env and forcing re-login.
- [Login timing side channel] → Generic error message; timing differences are minor and accepted; bcrypt compare is run even for unknown emails to equalize cost (decision: always hash-compare against a dummy hash when email not found).
- [Dependency on `add-user-crud-mongo`] → This change must be applied after the users entity exists (model, repository, service, bcryptjs, zod). Tasks list the prerequisite explicitly.

## Migration Plan

1. Implement auth layer (config, middleware, routes) and mount middleware on `/api/users`.
2. No database migrations required (no new collections/indexes).
3. Deploy: set `JWT_SECRET` (and optionally `JWT_EXPIRES_IN`) in the environment, restart the backend.
4. Rollback: remove middleware from routes and/or revert code; clients lose API access immediately after redeploy.

## Open Questions

None.
