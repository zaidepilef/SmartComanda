## Why

The login and registration pages show raw English backend error messages ("Invalid credentials.", "This account awaits verification.") inside a fully Spanish UI. Users cannot tell why login failed: wrong credentials, pending verification, or a blocked account.

## What Changes

- Add a frontend error-message mapping that translates known backend auth errors to Spanish:
  - `Invalid credentials.` → "Credenciales inválidas."
  - `This account awaits verification.` → "Tu cuenta está pendiente de verificación interna."
  - `This account is inactive.` → "Tu cuenta está bloqueada."
- Unknown backend errors fall back to a generic Spanish message.
- Apply the mapping to both the login and registration pages (shared helper).
- The backend keeps returning generic, security-safe messages — no API changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-auth`: login and registration scenarios that "show the backend error message" now show a localized Spanish message.

## Impact

- **Frontend (Angular) only**: new `authErrorMessage()` helper (likely in `auth.service.ts` or a small util), used by `login.component` and `register.component`.
- **Backend**: no changes.
- **Specs**: `admin-auth` delta with modified login/registration scenarios.
- **No security impact**: the API still never reveals whether an email exists (401 remains generic).