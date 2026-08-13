## 1. Prerequisites and Dependencies

- [x] 1.1 Confirm `add-user-crud-mongo` is implemented (user model with `passwordHash`, repository, service, bcryptjs, zod, migration runner) before starting
- [x] 1.2 Add `jsonwebtoken` to `backend/package.json` and install it
- [x] 1.3 Add `JWT_SECRET` and `JWT_EXPIRES_IN` to `backend/src/config/env.js`; fail fast at startup when `JWT_SECRET` is missing or shorter than 32 characters
- [x] 1.4 Update `.env.example` with `JWT_SECRET` and `JWT_EXPIRES_IN` placeholders (no real secret)

## 2. Auth Service

- [x] 2.1 Create `backend/src/services/authService.js` with `login(email, password)` that finds the user by email, checks `status === active`, compares the password with bcrypt (always running a compare even when the email is unknown, against a dummy hash), and throws domain errors (401 generic, 403 inactive)
- [x] 2.2 Add `issueToken(user)` signing a JWT with `sub`, `email`, `status` claims, HS256, and `JWT_EXPIRES_IN`
- [x] 2.3 Verify `login` never distinguishes unknown-email from wrong-password in its error message

## 3. Auth Middleware

- [x] 3.1 Create `backend/src/middleware/authRequired.js` that parses `Authorization: Bearer <token>`, verifies signature and expiry with `JWT_SECRET`, loads the user by `sub`, rejects non-active or deleted users, and attaches the user to the request
- [x] 3.2 Return 401 for missing header, non-Bearer scheme, malformed/tampered/expired token, and unknown user
- [x] 3.3 Export the middleware for router-level reuse

## 4. Auth Routes

- [x] 4.1 Create `backend/src/controllers/authController.js` mapping domain errors (400, 401, 403, 409) and returning 200/201 responses with token, expiresIn, and public user (no `passwordHash`)
- [x] 4.2 Create `backend/src/routes/auth.js` with `POST /login`, `POST /register` (delegating to `userService.createUser`), and `GET /me` protected by `authRequired`
- [x] 4.3 Add zod schemas for login and register payloads (including a minimum password length) and validate inputs with 400 responses
- [x] 4.4 Mount the auth router at `/api/auth` in `backend/src/server.js`

## 5. Protect User Routes

- [x] 5.1 Apply `authRequired` middleware to the `/api/users` router so all CRUD endpoints require a valid Bearer token
- [x] 5.2 Verify `/health` remains public and unauthenticated `/api/users` requests return 401

## 6. Verification

- [x] 6.1 End-to-end test: register a user, login, call `/api/auth/me` with the token, call `/api/users` with and without the token
- [x] 6.2 Test failure paths: wrong password (401, generic message), inactive user (403), expired/malformed token (401), duplicate email (409), invalid payloads (400)
- [x] 6.3 Confirm no response ever contains `passwordHash`
- [x] 6.4 Run `openspec validate add-user-auth-jwt` and confirm the change validates
