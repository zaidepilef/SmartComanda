## 1. Error mapping helper

- [x] 1.1 Add `authErrorMessage(raw: string | undefined): string` to `auth.service.ts` mapping the known backend messages (Invalid credentials, awaits verification, inactive, captcha failed) to Spanish with a generic fallback

## 2. Apply mapping in pages

- [x] 2.1 Use `authErrorMessage` for the login error in `login.component.ts` (replace direct `err.error?.error`)
- [x] 2.2 Use `authErrorMessage` for the register error in `register.component.ts` (replace direct `err.error?.error`)

## 3. Validation

- [x] 3.1 `ng build` passes
- [x] 3.2 Manual check: login with wrong password shows "Credenciales inválidas...", pending account shows pending message, inactive account shows blocked message