## Context

See proposal.md - Why. The backend deliberately returns generic English messages for security (401 never reveals whether the email exists). The status-specific 403 messages ("awaiting verification" / "inactive") already let the frontend differentiate pending vs blocked accounts after a correct password.

## Goals / Non-Goals

**Goals:**
- Show every auth error in Spanish in the admin panel.
- Let the user distinguish: wrong credentials (401) vs pending verification (403 pending) vs blocked account (403 inactive).

**Non-Goals:**
- Changing backend messages or behavior.
- Revealing whether an email exists in the 401 path (stays generic).

## Decisions

### 1. Frontend mapping table, backend untouched
A single exported helper maps known backend error strings to Spanish. Backend errors stay English/generic — safer for future API consumers (WhatsApp bot, n8n) and keeps the API language-neutral.

### 2. Mapping by exact message string
The backend error contract is stable (`err.error?.error`), and the strings are few and fixed. A simple `Record<string, string>` lookup with a Spanish fallback is the KISS option; no error codes or i18n framework needed at this scale.

### 3. Where the helper lives
`authErrorMessage(raw: string | undefined): string` exported from `auth.service.ts` (already shared by login and register components) — avoids a new util file for two call sites. Falls back to "No se pudo completar la operación. Intenta nuevamente."

### 4. Messages
- `Invalid credentials.` → `Credenciales inválidas. Verifica tu email y contraseña.`
- `This account awaits verification.` → `Tu cuenta está pendiente de verificación interna.`
- `This account is inactive.` → `Tu cuenta está bloqueada.`
- `Captcha verification failed.` → `La verificación de seguridad falló. Intenta nuevamente.` (register page)

## Risks / Trade-offs

- **Message drift**: if the backend rewrites a message, the mapping silently falls back to the generic Spanish message → Mitigation: fallback is user-friendly; mapping is centralized in one place.
- **Revealing "pending/blocked" states in the UI**: already the accepted trade-off from the registration-verification change (registration is public anyway); the API 403 still only fires after a correct password.

## Migration Plan

Frontend-only change: ship together with the next frontend deploy; no rollback risk (mapping is additive).

## Open Questions

None.