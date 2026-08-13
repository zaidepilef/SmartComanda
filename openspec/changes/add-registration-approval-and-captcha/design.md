## Context

See proposal.md - Why. Current state: backend is Express + MongoDB with layered structure (controllers/services/repositories); frontend is standalone Angular components with Signals. The users CRUD already supports listing with `?status=` filter and updating any field including `status`. There is no roles system and no users page in the frontend yet.

## Goals / Non-Goals

**Goals:**
- Close the spam/bot hole in public registration with a verifiable anti-bot check.
- Introduce a `pending` account state that blocks login until a panel user approves it.
- Provide a minimal users page (list, approve, reject, edit) in the Angular panel.

**Non-Goals:**
- Role-based authorization (any authenticated user may manage users).
- Email notifications to users about approval/rejection.
- Alternative verification channels (WhatsApp, invitations).

## Decisions

### 1. Cloudflare Turnstile (managed widget) over reCAPTCHA/hCaptcha
Free without usage limits, no paid API tier, auto-localizes to Spanish, and simpler than Google's dashboard. Managed widget mode gives the visible "I'm not a robot" checkbox UX. Site keys are per-domain: separate keys for `localhost` and production.

### 2. Backend verification is authoritative
The frontend token is verified server-side on every registration via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` (secret key + remote IP). A new `captchaService.js` wraps this call; failure or provider timeout → 400 with no user created. If Turnstile is unreachable, registration fails closed (no user created) — safer than silently opening the door.

### 3. New `pending` status, register always creates `pending`
`USER_STATUS` gains `PENDING: "pending"`. `createUserWithPassword` keeps `active` as default for admin-created users (unaffected), while the register controller passes `pending` explicitly. Login checks `pending` before the generic inactive branch with a distinct 403 message.

### 4. Approval/rejection = existing status update, no new endpoint
`PUT /api/users/:id` already supports status changes and is the single mutation path. Approve = status `active`, reject = status `inactive`. This avoids duplicating mutation logic; the frontend page just calls the existing service. List view uses `?status=pending` for the default queue tab.

### 5. Confirm password is client-side only
Cross-field validator on the form (revalidates when either field changes). `confirmPassword` is never sent to the backend — the zod schema stays untouched for it, avoiding schema churn and reducing payload.

### 6. Frontend Turnstile integration
Load `https://challenges.cloudflare.com/turnstile/v0/api.js` once (index.html, `defer`). A small reusable `TurnstileComponent` renders the widget into a div, exposes a signal with the current token, and exposes `reset()`. The register form disables submit until the token exists; on backend rejection the component resets the widget and the form clears the token. Site key lives in `environments/environment*.ts` (dev vs prod).

### 7. Registration success = informational state, not a redirect
After 201, the register page swaps to a success view ("Tu cuenta está pendiente de verificación interna...") with a link to login, instead of redirecting to login (which would 403 and confuse). This is a component-internal state, no new route.

### 8. Users page in the panel
New `views/users` page + route under the layout guard: Bootstrap table with status badges (pending/active/inactive), filter chips or select by status, action buttons (Aprobar / Rechazar) that call `PUT /api/users/:id`, and an edit form (firstName, lastName, email, status) — modal or inline. Any authenticated user can access (no roles yet). Uses a new `UserService` wrapping the existing `/api/users` endpoints.

## Risks / Trade-offs

- **No roles → any authenticated user can approve/edit/delete users** → Accepted for MVP; revisit when multi-admin or tenants arrive. Flagged in proposal.
- **Turnstile adds an external dependency and per-domain key management** → Mitigated by env vars; widget fails visibly in dev if keys are missing, and registration fails closed server-side.
- **Pending accounts accumulate with no notification** → Admin queue is the current workflow; a badge/count on the users page is cheap to add later.
- **Failed provider call blocked registration (fail closed)** → Turnstile has high availability; acceptable trade-off for a small panel.
- **Existing login message says "inactive" for all non-active states** → The pending message reveals account existence on 403; acceptable because registration is public anyway.

## Migration Plan

1. Add `pending` to the model and register flow; existing data unaffected (no rows change).
2. Add Turnstile env vars to backend `.env` and frontend `environments/environment*.ts` (plus `.env` used by the frontend Dockerfile if applicable).
3. Deploy backend first (old frontend still works: captchaToken missing → 400... no: old frontend would break. See Open Questions).
4. Then frontend (register + users page).

## Open Questions

- **Backward compatibility of the register endpoint**: old frontend sends no `captchaToken`; making the field required breaks stale clients immediately. The spec says required (fails closed) — safer to require it and ship frontend+backend together. If a soft rollout is needed later, the schema can be relaxed to optional-when-behind-flag, but that is not the plan.