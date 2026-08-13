## 1. Backend: Token revocation

- [x] 1.1 Add `revoked_tokens` collection handling (jti + TTL index) in a new repository or service module
- [x] 1.2 Add `logout` method to `authService` that revokes the presented token's jti
- [x] 1.3 Add `POST /api/auth/logout` route + controller handler (authenticated, responds 204)
- [x] 1.4 Update `authRequired` middleware to reject revoked tokens with 401

## 2. Frontend: Auth foundation

- [x] 2.1 Add `provideHttpClient(withInterceptors(...))` to `app.config.ts`
- [x] 2.2 Create `AuthService` (login, register, logout, me, token get/set/clear in localStorage)
- [x] 2.3 Create `authGuard` protecting layout routes and redirecting to `/login`
- [x] 2.4 Create HTTP interceptor attaching Bearer token and handling 401 (clear + redirect to login)
- [x] 2.5 Configure public routes `/login` and `/register` outside the layout; protect all layout children

## 3. Frontend: Pages and integration

- [x] 3.1 Create login page component with form, error display, redirect to `/dashboard` on success
- [x] 3.2 Create register page component with form, error display, redirect to `/login` on success
- [x] 3.3 Load user profile from `/api/auth/me` after login and display it (dashboard and/or header)
- [x] 3.4 Add logout action in the layout header: call endpoint, clear token, redirect to `/login`
- [x] 3.5 Redirect authenticated users away from `/login` and `/register` to `/dashboard`

## 4. Cleanup and verification

- [x] 4.1 Delete the `add-non-jwt-login` change directory
- [x] 4.2 Verify backend: login, logout, revoked-token 401, TTL cleanup
- [x] 4.3 Verify frontend: login, register, guard redirects, authenticated API calls, logout