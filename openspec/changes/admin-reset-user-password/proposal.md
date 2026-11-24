## Why

El sysadmin (y los admin por tenant) no tienen forma de restablecer la contraseña de acceso de otros usuarios del sistema desde el panel de administración. El backend ya acepta `password` en `PUT /api/users/:id`, pero el frontend no lo expone y no existe una acción dedicada. Además, los usuarios migrados desde MongoDB sin `password_hash` (p. ej. `naty.uwu.ru@gmail.com`) rompen el login con error 500 en vez de devolver "Invalid credentials", lo que impide sanar esas cuentas.

## What Changes

- **Nueva acción "Resetear contraseña"** en la vista de usuarios del admin: botón por fila que abre un modal de confirmación con un campo para la nueva clave. Se envía por un endpoint/operación dedicada, distinta del formulario de edición, para evitar sobrescribir la clave por accidente.
- **Regla de autorización**: se reutiliza `canManageUser` — sysadmin puede resetear la clave de cualquier usuario; admin solo de usuarios de su propio tenant (excluyendo sysadmin).
- **Corrección de login**: `POST /api/auth/login` con `password_hash` nulo devuelve **"Invalid credentials"** (401) en vez de lanzar un error 500. Esto permite identificar correctamente cuentas sin clave y sanea a los usuarios migrados.
- **Fuera de alcance**: flujo autoservicio "olvidé mi clave" (requiere email/token) — será un cambio futuro separado.

## Capabilities

### New Capabilities
- `admin-reset-password`: El panel de administración permite a un sysadmin (o admin dentro de su tenant) reestablecer la contraseña de otro usuario mediante una acción dedicada con confirmación, persistida en PostgreSQL.

### Modified Capabilities
- `user-auth`: El login debe tratar `password_hash` nulo/ausente como credenciales inválidas (HTTP 401 "Invalid credentials"), no como un error interno.

## Impact

- **Backend** (`@backend`): nuevo endpoint dedicado (p. ej. `POST /api/users/:id/reset-password`) con validación de nueva clave (≥ 8 caracteres) y autorización vía `canManageUser`; ajuste en `authService.login` para el caso de hash nulo.
- **Frontend admin** (`@frontend-admin`): botón + modal "Resetear contraseña" en `users.component` (`users.component.ts` / `.html`) y nuevo método en `user.service.ts`.
- **Tests**: caso de login con hash nulo y caso de reset sin autorización.
- **Docs**: Swagger del nuevo endpoint.