## 1. Backend: endpoint de reset de contraseña

- [x] 1.1 Add `resetPasswordSchema` in `src/validation/userSchemas.js` validating `{ password: z.string().min(8) }`
- [x] 1.2 Add `resetUserPassword({ actor, id, password })` in `src/services/userService.js` (404 if not found, `canManageUser` → 403, bcrypt hash, `updateUser(id, { passwordHash })`, return `toPublicUser`)
- [x] 1.3 Add `resetUserPassword` handler in `src/controllers/userController.js` with Swagger docs
- [x] 1.4 Register `POST /:id/reset-password` in `src/routes/users.js` behind `authRequired` + `requireSysadminOrAdmin` + `validateBody(resetPasswordSchema)`

## 2. Backend: login robusto ante password_hash nulo

- [x] 2.1 In `src/services/authService.js` `login`, treat a missing/non-string `passwordHash` as invalid credentials (compare against `DUMMY_HASH`, throw 401 generic), avoiding `bcrypt.compare` throwing

## 3. Backend: tests

- [x] 3.1 Add unit test: login with a user whose `passwordHash` is null responds with invalid credentials (401) instead of crashing
- [x] 3.2 Add unit/service test: reset by non-privileged role → 403 and no change
- [x] 3.3 Add unit/service test: successful reset updates the hash and returns the public user without the password hash
- [x] 3.4 Run `npm test` — all tests pass

## 4. Frontend admin: UI del reset

- [x] 4.1 Add `resetPassword(id, password)` in `src/app/views/users/user.service.ts` calling `POST /api/users/:id/reset-password`
- [x] 4.2 Add "Resetear contraseña" button per row in `src/app/views/users/users.component.html` with a confirmation dialog (password input, minlength 8, confirm/cancel)
- [x] 4.3 Wire the dialog logic in `users.component.ts`: open with the target user, confirm calls `resetPassword` and reloads the list, cancel sends nothing, success/error feedback

## 5. Verificación final

- [x-in-progress] 5.1 Verify the reset flow end-to-end against the running stack: sysadmin resets a user's password, then login with the new password succeeds
- [x] 5.2 Verify the admin panel shows the reset action and reloads the list after a successful reset