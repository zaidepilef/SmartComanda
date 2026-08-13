## Why

The admin frontend (frontend-admin) currently has no authentication: no login or registration pages, no route protection, and no way to consume the existing JWT API. Users registered in MongoDB cannot access the admin panel. Additionally, the backend has no logout mechanism, so issued JWTs remain valid until expiration.

## What Changes

- Add public `/login` and `/register` pages in frontend-admin, outside the main layout, authenticating against the existing `/api/auth` endpoints.
- Add an `AuthService` with login, register, logout, and current-user methods; store the JWT in `localStorage`.
- Add an auth guard protecting all layout routes, redirecting unauthenticated users to `/login`.
- Add an HTTP interceptor attaching `Authorization: Bearer <token>` to requests, with 401 handling that logs the user out.
- After login, redirect to `/dashboard` and load the user profile via `/api/auth/me`.
- Add a `POST /api/auth/logout` endpoint on the backend that revokes the token via a blacklist, and make the bearer middleware reject revoked tokens.
- Discard the never-implemented `add-non-jwt-login` change.

## Capabilities

### New Capabilities
- `admin-auth`: Frontend authentication flow for the admin panel: login and register pages, token storage, route guard, and authenticated API access.

### Modified Capabilities
- `user-auth`: Adds token revocation on logout and blacklist enforcement in the bearer middleware.

## Impact

- Backend: `authService` (blacklist store + logout), `authRequired` middleware (revocation check), `authController`, `routes/auth.js`.
- Frontend: `app.routes.ts`, `app.config.ts` (provideHttpClient), new `auth` module (pages, service, guard, interceptor), layout header (user info + logout).
- Discarded: `openspec/changes/add-non-jwt-login/`.