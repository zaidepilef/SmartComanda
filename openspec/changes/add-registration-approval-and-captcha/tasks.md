## 1. Backend: pending status and captcha

- [x] 1.1 Add `PENDING: "pending"` to `USER_STATUS` and to `USER_STATUSES` in `backend/src/models/user.js`
- [x] 1.2 Create `backend/src/services/captchaService.js` that verifies a Turnstile token against Cloudflare siteverify (secret key + remote IP), failing closed on provider errors
- [x] 1.3 Add `TURNSTILE_SECRET_KEY` to `backend/src/config/env.js`
- [x] 1.4 Require `captchaToken` in `createUserSchema` (used by `/api/auth/register`) in `backend/src/validation/userSchemas.js`
- [x] 1.5 In `authController.register`, verify the Turnstile token via the service before creating the user; map provider failure to HTTP 400
- [x] 1.6 In `authController.register`, create the user with `status: "pending"` (admin-created users keep `active` default in `userService`)
- [x] 1.7 In `authService.login`, reject `pending` users with a distinct 403 message ("account awaits verification") before the generic inactive branch

## 2. Frontend: register page (confirm password + Turnstile)

- [x] 2.1 Add `TURNSTILE_SITE_KEY` to `environments/environment.ts` and `environment.development.ts`
- [x] 2.2 Load the Turnstile script (`challenges.cloudflare.com/turnstile/v0/api.js`, defer) in `index.html`
- [x] 2.3 Create a reusable `TurnstileComponent` (renders the widget, exposes token signal + `reset()`)
- [x] 2.4 Add `confirmPassword` field with a cross-field validator (revalidates on either field change) and Bootstrap error feedback in `register.component`
- [x] 2.5 Require the Turnstile token in the form; disable submit until solved
- [x] 2.6 Send `captchaToken` in the register payload (`auth.service.ts` `RegisterPayload` + call)
- [x] 2.7 On success, swap the register page to a "pending verification" info state with a link to login (no redirect to login)
- [x] 2.8 On backend 400 (Turnstile rejected), show the error and reset the Turnstile widget

## 3. Frontend: users page (approve / reject / edit)

- [x] 3.1 Create `UserService` in the frontend wrapping list (`?status=` filter), update, and delete endpoints of `/api/users`
- [x] 3.2 Create `views/users` page: Bootstrap table with status badges, status filter (pending/active/inactive), and pagination if the API returns it
- [x] 3.3 Add approve (→ active) and reject (→ inactive) actions calling `PUT /api/users/:id`, with error feedback
- [x] 3.4 Add an edit form (firstName, lastName, email, status) — modal or inline — calling the same update endpoint
- [x] 3.5 Register the `/users` route in `app.routes.ts` under the authenticated layout

## 4. Validation and docs

- [x] 4.1 Verify backend: `npm run lint`/tests pass; register with fake token → 400; register without token → 400; register with valid token → 201 + status `pending`; login as pending → 403 pending message
- [x] 4.2 Verify frontend: `ng build` passes; register form blocks without captcha and mismatched passwords; users page lists/approves/rejects
- [x] 4.3 Add Turnstile keys to `.env`/environment docs (backend and frontend) and note the per-domain key requirement
- [x] 4.4 Update main specs via `/opsx-archive` (or `/opsx-sync-specs`) once verified