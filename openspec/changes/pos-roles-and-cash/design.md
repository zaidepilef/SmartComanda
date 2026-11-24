## Context

- `USER_ROLES` (`backend/src/models/user.js`) tiene `sysadmin`, `owner`, `admin`, `cashier`; la tabla `roles` (ids 1–4) guarda los nombres visibles. No existe un rol de cocina.
- `routes/orders.js` y `routes/cash-sessions.js` no validan rol: cualquier usuario autenticado del tenant crea, cobra y cancela pedidos, y abre o cierra caja.
- `routes/users.js` usa `requireSysadminOrAdmin`, que deja fuera al `owner`.
- `cashSessionService.closeCashSession` calcula el arqueo pero `closeSession` solo guarda `closed_at` y `closed_by`: la diferencia se pierde.
- `payOrder` marca el pedido como pagado y suma en caja en dos sentencias sin transacción, y el pedido no guarda en qué caja se cobró.
- Los pedidos QR se crean `new` + `pending` y hoy aparecen en cocina antes de cobrarse.
- En desarrollo hay una caja abierta desde 2026-09-08 en El Hamburgueson: abrir otra responde 409 y el POS no lo explica, que es lo que se percibe como "no puedo abrir la caja".

## Goals / Non-Goals

**Goals:**
- Una sola matriz de permisos aplicada en la API (fuente de verdad) y reflejada en POS y admin.
- Rol `cook` y nombre visible "Encargado" para `admin`.
- Anular con motivo y reverso en caja; corregir antes de cobrar.
- Cierre de caja que persiste el arqueo; caja antigua visible y cerrable.
- QR: cobrar desde el POS y recién entonces pasar a cocina.

**Non-Goals:**
- Integraciones de pago (Mercado Pago, KLAP), reembolsos reales o boletas.
- Permisos configurables por tenant (la matriz es fija en código).
- Cambiar el flujo del cliente QR.

## Decisions

1. **Matriz de permisos en código, por acción.** `backend/src/utils/permissions.js` (con `middleware/requirePermission.js`) exporta `PERMISSIONS = { 'order.create': [...roles], 'order.cancel': [...], ... }` y un middleware `requirePermission(action)`. Las rutas declaran la acción, no la lista de roles. *Alternativa descartada*: tabla de permisos en la base; agrega complejidad sin necesidad actual.
2. **Rol `cook` por migración.** `014_pos_roles_and_cash.js` inserta el rol 5 `cook`/"Cocinero" (idempotente) y renombra el visible de `admin` a "Encargado". El código del rol `admin` no cambia, así que no hay migración de usuarios. POS y admin usan un mapa `ROLE_LABELS` compartido por app para mostrar el nombre.
3. **Quién asigna qué rol.** `ASSIGNABLE_ROLES = { sysadmin: todos, owner: [admin, cashier, cook], admin: [cashier, cook] }` en `userService`; reemplaza el chequeo puntual de `ADMIN`. `requireSysadminOrAdmin` pasa a `requirePermission('user.manage')`, que incluye `owner`.
4. **Pedidos guardan su caja.** La misma migración agrega a `orders`: `cash_session_id`, `paid_at`, `cancel_reason`, `cancelled_by`, `cancelled_at`, `corrected_by`, `corrected_at`; y `payment_status` admite `refunded`. Cobrar y anular corren en una transacción (`BEGIN … COMMIT` con `SELECT … FOR UPDATE` sobre el pedido y la caja).
5. **Anular es un endpoint propio.** `POST /api/orders/:id/cancel { reason }`. `PATCH /:id/status` rechaza `cancelled` con 403 salvo para quienes tengan `order.cancel`, y aun así exige usar `/cancel` para registrar el motivo (responde 400 si llega `cancelled` sin motivo). Si el pedido está pagado, se revierte en su `cash_session_id`; si esa caja está cerrada, 409 (el reverso en otra caja descuadraría ambas).
6. **Corregir es `PUT /api/orders/:id/items`.** Solo `pending` + `new`. Reusa la resolución de precios de `createOrder` (se extrae a una función común) y no descuenta stock, igual que el QR.
7. **QR sin cobrar no entra a cocina.** `GET /api/orders` acepta `kitchen=true`, que excluye `orderType = qr AND paymentStatus = pending`; la transición `new → preparing` de esos pedidos responde 409. Los pedidos del POS sin cobrar siguen pasando a cocina (comer y pagar después).
8. **Arqueo persistido.** Tabla `cash_session_closures(session_id, method, expected, counted, difference)` más `closing_note` en `cash_sessions`. Efectivo esperado = apertura + ventas en efectivo. Se elige tabla por método, igual que `cash_session_totals`, en vez de columnas por medio de pago.
9. **Acceso por app.** El admin rechaza en el login (y en el guard) a usuarios que solo tienen `cashier` o `cook`. El POS arma menú y rutas según rol: el `cook` va directo a Cocina, con un guard que bloquea `pos`, `orders` y `cash`.
10. **POS: errores claros.** El interceptor traduce 403 a "Tu rol no permite esta acción". La pantalla de caja muestra 409 como "Ya hay una caja abierta" y recarga la caja actual.

## Risks / Trade-offs

- **BREAKING para cajeros que hoy cancelan.** → Se comunica: anular pasa a Encargado o superior.
- **Superposición con la rama local `fix/user-role-update` del admin (Sources)** en auth y usuarios. → La parte admin se implementa después de integrar o descartar esa rama; se pregunta antes de tocarla.
- **Cajas abiertas viejas en producción** quedarían con arqueo vacío. → Se cierran con el flujo nuevo; las cerradas antes de la migración no tienen filas de arqueo y la UI lo muestra como "sin arqueo".
- **Puntos de fidelidad**: anular un pedido cobrado no revierte los puntos que ganó el cliente. → Pendiente para un cambio de `loyalty-points`.
- **Pedidos cobrados antes de la migración** no tienen `cash_session_id`: anularlos responde 409 (no se sabe en qué caja revertir).
- **Concurrencia al cobrar dos veces el mismo QR desde dos cajas.** → `FOR UPDATE` y la condición `payment_status = 'pending'` en el `UPDATE`.

## Migration Plan

1. Desplegar la API con la migración 014 (aditiva, idempotente).
2. Desplegar POS y admin.
3. Cerrar desde el POS las cajas que hayan quedado abiertas.
4. Rollback: la migración solo agrega columnas, tablas y un rol, y el código anterior las ignora. Para revertir basta desplegar la versión previa, siempre que no haya usuarios con rol `cook`; si los hay, primero se les cambia el rol.

## Open Questions

- ¿El `cashier` puede marcar "entregado"? Se asume que sí (entrega en mostrador).
- ¿Se permite anular un pedido `ready`? Se asume que sí, por ejemplo si el cliente no lo retira.
