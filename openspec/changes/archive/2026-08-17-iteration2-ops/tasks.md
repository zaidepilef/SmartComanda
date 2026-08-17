## 1. Backend: cierre de caja

- [x] 1.1 Extender `validation/cashSessionSchemas.js`: `closeCashSessionSchema` con `closingAmounts` (object de `cash|debit|credit|transfer` con valores >= 0, opcional).
- [x] 1.2 En `repositories/cashSessionRepository.js`: `closeSession` con `findOneAndUpdate` filtrado por `{_id, tenantId, status: "open"}` y `$set` de `status/closedAt/closedBy/closingAmounts/difference/updatedAt`.
- [x] 1.3 En `services/cashSessionService.js`: `closeCashSession(actor, id, closingAmounts)` — resuelve sesión scoped al tenant (404 si no existe/otro tenant), `closingAmounts ?? totals` como arqueo, `difference` por método, 409 si la sesión ya estaba cerrada (match nulo del update).
- [x] 1.4 En `controllers/cashSessionController.js` + `routes/cash-sessions.js`: `POST /api/cash-sessions/:id/close` con `validateBody`.

## 2. Backend: asignación de sucursal al usuario

- [x] 2.1 Extender `validation/userSchemas.js` (create/update): `branchId` ObjectId opcional.
- [x] 2.2 Extender el modelo/servicio de usuarios para persistir `branchId` (scoped al tenant del usuario: la sucursal debe pertenecer al mismo tenant, 400 si no).
- [x] 2.3 Incluir `branchId` en las respuestas públicas del usuario (`toPublicUser`).

## 3. Backend: listado y detalle de pedidos

- [x] 3.1 Crear `validation/orderQuerySchemas.js`: `listOrdersQuerySchema` (`branchId`, `status`, `orderType`, `paymentStatus`, `paymentMethod`, `from`, `to`, `q`, `limit` default 50 max 200, `offset`) y `getOrderParamsSchema`.
- [x] 3.2 En `repositories/orderRepository.js`: `listOrders(filter)` con build de filtro (tenant, branch, fechas ISO, `$or` sobre number/clientContact para `q`) y sort `createdAt: -1` con `limit/offset`; `findOrderById(id)` scoped.
- [x] 3.3 En `services/orderService.js`: `listOrders(actor, query)` con scoping por rol — `cashier` fijado a `actor.branchId` (400 si no tiene asignada), `admin/owner` tenant (branchId opcional validado al tenant), `sysadmin` vía `tenantId`; `getOrder(actor, id)`.
- [x] 3.4 En `controllers/orderController.js` + `routes/orders.js`: `GET /api/orders` (validateQuery) y `GET /api/orders/:id`.

## 4. Backend: ciclo de estados KDS

- [x] 4.1 Extender `models/order.js`: `ORDER_STATUSES` con `new|preparing|ready|delivered|cancelled`, `ORDER_STATUS_TRANSITIONS` (whitelist), campo `statusHistory` en `toOrderDocument`.
- [x] 4.2 Crear `validation/orderStatusSchemas.js`: `updateOrderStatusSchema` (`status` del enum).
- [x] 4.3 En `services/orderService.js`: `updateOrderStatus(actor, id, status)` — acceso scoped (cashier: su sucursal; otros: tenant), 404 si no existe, 409 si la transición no está en la whitelist, append a `statusHistory` con `{status, at, by}`.
- [x] 4.4 En `controllers/orderController.js` + `routes/orders.js`: `PATCH /api/orders/:id/status`.

## 5. Backend: migración 008

- [x] 5.1 Crear `migrations/008_order_listing_and_statuses.js`: índices `{tenantId, foodtruckId, createdAt: -1}` y `{status}` en orders; normalizar `pending → new`; inicializar `statusHistory` en pedidos existentes.

## 6. frontend-admin: usuarios y pedidos

- [x] 6.1 Vista de usuarios: selector de sucursal (solo sucursales activas del tenant) en create/edit para roles con tenant.
- [x] 6.2 Crear `services/orders.service.ts` en admin: `list` (filtros) y `getById`; tipos de order con `status`, `number`, `items`, `totals`.
- [x] 6.3 Nueva vista `orders`: tabla con número, contacto, tipo, estado, método, total, fecha; filtros (sucursal, estado, método, rango de fechas, búsqueda); acceso por rol (cashier: sucursal fija desde `user.branchId`).
- [x] 6.4 Detalle expandible del pedido: items con snapshot (nombre, cantidad, observación, precio, subtotal) y datos de pago.
- [x] 6.5 Registrar ruta `orders` con lazy loading en `app.routes.ts` (guard de admin existente).

## 7. frontend-pos: cierre de caja

- [x] 7.1 Extender `services/cash-sessions.service.ts` (POS): `close(id, closingAmounts?)`.
- [x] 7.2 Pantalla de caja: sección "Cerrar caja" con arqueo por método (pre-llenado con los totales de la sesión) y validación de montos >= 0.
- [x] 7.3 Confirmación de cierre: mostrar resumen del corte (totales, orderCount, diferencias por método) y limpiar la sesión del store tras cerrar.

## 8. frontend-pos: KDS

- [x] 8.1 Extender `services/orders.service.ts` (POS): `listByBranch(branchId)`, `updateStatus(id, status)`; tipos con `status`, `statusHistory`, `createdAt`.
- [x] 8.2 Vista `kds`: polling cada 10s de los pedidos de la sucursal, agrupados por estado (`new/preparing/ready`), tarjetas con número, tiempo transcurrido, items con cantidades y observaciones.
- [x] 8.3 Acciones de un toque: avanzar (`new → preparing`, `preparing → ready`, `ready → delivered`) y cancelar (`new/preparing → cancelled`), con manejo de 409.
- [x] 8.4 Ruta `/kds` bajo `contextGuard` + enlace en el header del POS.

## 9. frontend-pos: boleta

- [x] 9.1 Componente de boleta: sucursal, fecha/hora, número, tipo de pedido, items (nombre, cantidad, observación, precio unitario, subtotal), total, método de pago, monto recibido y vuelto para efectivo.
- [x] 9.2 Impresión: `@media print` que oculta la app y muestra solo la boleta (80mm); botón "Imprimir" que llama `window.print()`; integrar tras el pago exitoso (reemplaza/aumenta el modal de confirmación actual).

## 10. Validación

- [x] 10.1 `openspec validate` del change, build de frontend-admin y frontend-pos, `npm test` del backend.
- [x] 10.2 Smoke test E2E: asignar sucursal a cashier, listado de pedidos por rol, transición de estados con 409 en transición inválida, cierre de caja con arqueo y diferencia, 409 en doble cierre, apertura tras cierre, boleta en pantalla.
