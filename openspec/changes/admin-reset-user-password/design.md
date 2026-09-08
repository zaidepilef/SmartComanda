## Context

See proposal.md - Why. La autorización de usuarios ya existe y es reutilizable: `canManageUser` en `src/utils/tenantScope.js` valida que el actor (sysadmin global, o admin del mismo tenant) pueda gestionar al target. El backend ya sabe hashear con bcrypt (`userService.js`). El login en `authService.js:30` llama `bcrypt.compare(password, user.passwordHash)` sin tolerar `password_hash` nulo (caso real de cuentas migradas), lo que produce un 500. El frontend admin tiene la vista de usuarios completa (`users.component.ts/html`) y el servicio expone `update(id, payload)` que ya acepta `password` en su tipo, pero ningún flujo lo usa.

## Goals / Non-Goals

**Goals:**
- Proveer una operación dedicada y explícita de reset de contraseña en la API, con autorización reutilizando `canManageUser`.
- Exponer en el panel una acción "Resetear contraseña" con confirmación, separada del formulario de edición de perfil.
- Hacer el login robusto ante `password_hash` nulo/ausente (401 genérico, no 500).

**Non-Goals:**
- Cambiar el modelo de roles del frontend (el panel usa `role` singular) — fuera de alcance.
- Flujo autoservicio "olvidé mi clave" (email/OTP) — cambio futuro separado.
- Forzar cambio de clave en el próximo login o generar claves temporales.

## Decisions

### D1. Endpoint dedicado `POST /api/users/:id/reset-password`
En lugar de reutilizar la edición (`PUT /api/users/:id` con `password`), se agrega un endpoint dedicado:
```
POST /api/users/:id/reset-password
Authorization: Bearer <token>
{ "password": "NuevaClave123" }
```
- **Por qué**: (a) la spec exige que el reset no toque campos de perfil; (b) permite validar solo `password` (≥8) sin el `refine` de "al menos un campo" del `updateUserSchema`; (c) deja una superficie clara para auditoría futura y Swagger dedicado.
- **Alternativa considerada**: reutilizar `PUT /api/users/:id` con `{password}` — funciona hoy pero mezcla el reset con edición de perfil y complica la garantía de "solo se cambia la contraseña".

### D2. Reutilizar `canManageUser` para la autorización
La ruta usa `requireSysadminOrAdmin` (como el PUT) y el service llama `canManageUser(actor, existing)`. Esto cubre automáticamente: sysadmin → cualquiera; admin → mismo tenant, excluyendo a otros sysadmin.
- **Por qué**: consistencia con el resto de operaciones sobre usuarios y sin lógica nueva de autorización.
- Se valida con Zod (`resetPasswordSchema = z.object({ password: z.string().min(8, ...) })`) antes de entrar al service.

### D3. Lógica en servicio: método `resetUserPassword` dedicado
En `userService.js` se agrega `resetUserPassword({ actor, id, password })`:
1. `findUserById(id)` → 404 si no existe.
2. `canManageUser(actor, existing)` → 403 si no aplica.
3. `bcrypt.hash(password, BCRYPT_COST)`.
4. `updateUser(id, { passwordHash })` (solo ese campo) → devuelve `toPublicUser`.

El repositorio `updateUser` ya acepta `passwordHash` en su partial, así que no se toca la capa de datos.
- **Alternativa considerada**: enrutar al `updateUserById` existente — se descarta porque actualizaría "todo lo que venga" y diluye la semántica de reset.

### D4. Login robusto ante `password_hash` nulo
En `authService.login`, antes de `comparePassword`, se trata un `passwordHash` ausente/no string como credenciales inválidas:
```
if (!user.passwordHash) {
  await comparePassword(password, DUMMY_HASH); // mantiene timing uniforme
  throw new UnauthorizedError(GENERIC_LOGIN_ERROR);
}
```
- **Por qué**: cumple la spec (401 genérico sin filtrar estado) y evita que `bcrypt.compare(x, null)` reviente con 500. Mantener la comparación con `DUMMY_HASH` preserva el anti-enumeración por timing.

### D5. Frontend admin: acción + modal dedicados
- `user.service.ts`: método `resetPassword(id: string, password: string)` → `POST /api/users/${id}/reset-password`.
- `users.component.ts/html`: botón "Resetear contraseña" por fila (junto a "Editar") que abre un modal con campo password (minlength 8), confirmar que llama `resetPassword` y recarga, y cancelar que no envía nada.
- **Por qué**: UX de confirmación explícita (evita sobrescribir por accidente) y mantiene separado del form de perfil.

## Risks / Trade-offs

- **[Reutilizar `canManageUser` implica que admin puede resetear a su owner]** → Consistente con el resto de la gestión de usuarios ya existente; si se quiere endurecer, se revisa `canManageUser` globalmente en otro cambio.
- **[Frontend usa `role` singular mientras el backend expone `roles`]** → No se toca en este cambio; riesgo de visualización heredado, no de seguridad (la autorización la decide el backend con `canManageUser`).
- **[Cambio en endpoint de login]** → Solo agrega manejo del caso nulo; las rutas felices y los demás errores no cambian. Cubrir con test.
- **[Modal en tabla con paginación]** → Tras el reset se recarga la lista (`#load()`), patrón ya usado por `#setStatus`.

## Migration Plan

1. Backend: agregar `resetPasswordSchema` en `validation/userSchemas.js`; método `resetUserPassword` en `userService.js`; handler en `userController.js` con Swagger; ruta `POST /:id/reset-password` en `routes/users.js` protegida por `requireSysadminOrAdmin`.
2. Backend: fix login en `authService.js` (D4).
3. Tests: `npm test` (login con hash nulo; reset sin autorización → 403; reset exitoso → 200 sin hash).
4. Frontend admin: `user.service.ts` + `users.component.ts/html`.
5. Rollback: revertir el commit; no hay migración de esquema, el campo permitía null desde `006`.

## Open Questions

- Sin preguntas que cambien la spec, el enfoque o las tareas.