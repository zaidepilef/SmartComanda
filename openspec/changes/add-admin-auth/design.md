## Context

The backend already exposes JWT authentication against MongoDB users (`/api/auth/login`, `/register`, `/me`) protected by a Bearer middleware. The frontend-admin is a CoreUI/Angular 21 template with no HTTP client, no auth service, and no route protection. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Minimal backend surface: only what logout/revocation requires.
- Frontend auth as a reusable `auth` module (service, guard, interceptor, pages).

**Non-Goals:**
- Replacing localStorage with httpOnly cookies (deferred, accepted XSS risk).
- Session management, refresh tokens, or password reset flows.
- Role-based authorization beyond "authenticated or not".

## Decisions

- **JWT stored in localStorage**: Simplest path that keeps the existing stateless flow and survives reloads. Risk: XSS can exfiltrate the token — accepted for now, revisit with httpOnly cookies later.
- **Token blacklist in Mongo**: `POST /api/auth/logout` inserts the token's `jti` (or raw token hash) into a `revoked_tokens` collection with a TTL index matching token expiry; the middleware checks membership after JWT verification. Chosen over an in-memory Map (lost on restart) and over Redis (extra infra for one feature). TTL index auto-cleans expired entries.
- **Guard + interceptor split**: The route guard decides navigation; the interceptor attaches the token and handles 401 by clearing it and redirecting to `/login`. `provideHttpClient(withInterceptors(...))` added in `app.config.ts` since the app has no HTTP client today.
- **Public vs protected routes**: `/login` and `/register` are top-level routes outside the `DefaultLayout` shell; all layout children stay behind the guard. The login/register pages redirect to `/dashboard` if a token already exists.
- **Post-login flow**: navigate to `/dashboard`; the dashboard (or layout header) loads `/api/auth/me` to display the user's profile. Logout calls the endpoint, clears localStorage, and navigates to `/login`.
- **Discard `add-non-jwt-login`**: never implemented and superseded by the working JWT flow; its change directory is removed.

## Risks / Trade-offs

- [Security] JWT in localStorage is XSS-exfiltratable → Mitigation: accepted short-term; future work moves to httpOnly cookies (backend cookie-set change).
- [Security] Blacklist check adds a DB read per protected request → Mitigation: indexed lookup on `jti`, negligible at current scale.
- [Complexity] Duplicate 401 handling in interceptor vs guard → Mitigation: single 401 handler in the interceptor; the guard only checks token presence.
- [Migration] Users created before this change have no UI to register → Mitigation: registration page covers new accounts; existing accounts already exist in Mongo via the register endpoint.

## Migration Plan

1. Deploy backend logout endpoint + blacklist middleware (backward compatible: no existing tokens are revoked unless logged out).
2. Ship frontend auth module; protected routes redirect to `/login` once the guard is active.
3. Rollback: revert frontend routes/guard; backend blacklist is inert without the logout endpoint being called.

## Open Questions

- None blocking. Where the user profile is displayed (dashboard vs header) can be refined during implementation without affecting specs.