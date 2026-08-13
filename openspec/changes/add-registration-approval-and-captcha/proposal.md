## Why

The public registration endpoint is open to bots and spam, and newly registered users can immediately log in without any human verification. The system needs anti-bot protection (Cloudflare Turnstile) and an internal verification step where an authenticated panel user approves or rejects new accounts before they can access the panel.

## What Changes

- Add Cloudflare Turnstile ("I'm not a robot") widget to the registration page; the backend verifies the token before creating the user.
- Add a "confirm password" field to the registration form (client-side validation only, not sent to the backend).
- Add a new `pending` user status; public registration always creates users as `pending`.
- Login rejects `pending` accounts with a 403 "pending verification" message distinct from the inactive-account message.
- Registration success no longer leads directly to a usable account: the page tells the user their account awaits admin approval.
- Add a "Usuarios" page in the admin panel listing users with status filtering and actions to approve (→ `active`), reject (→ `inactive`), and edit user data. Accessible to any authenticated user (roles are out of scope for now).
- Rejected accounts can be re-activated by an admin; the unique email constraint stays in place.

## Capabilities

### New Capabilities

- `registration-verification`: anti-bot protection and the pending-approval lifecycle for public registration (Turnstile token validation, `pending` status, approve/reject flow).

### Modified Capabilities

- `user-auth`: registration endpoint now requires a valid Turnstile token and creates users with `pending` status; login adds a distinct rejection message for pending accounts.
- `users`: user entity status enum gains `pending`; listing supports filtering by it.
- `admin-auth`: registration page adds Turnstile + confirm password, and success redirects to a "pending approval" message page instead of implying immediate login.

## Impact

- **Frontend (Angular)**: `register.component` (new field + Turnstile widget + success state), `auth.service.ts` (register payload with `captchaToken`), new `users` page + route under the default layout, Turnstile site key in `environment`.
- **Backend (Node)**: new `services/captchaService.js` verifying tokens against Cloudflare's API; `models/user.js` adds `pending`; `validation/userSchemas.js` requires `captchaToken`; `authService.login` message for pending; new env vars `TURNSTILE_SECRET_KEY` (backend) and `TURNSTILE_SITE_KEY` (frontend).
- **External dependency**: Cloudflare Turnstile (site + secret keys per domain, including localhost).
- **Docs**: `.env` / environment files gain Turnstile keys.