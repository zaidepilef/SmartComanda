## 1. Backend: pedido con pago y numeración secuencial

- [x] 1.1 Extender `validation/orderSchemas.js`: `paymentMethod` enum `cash|debit|credit|transfer` opcional, `orderType` enum `takeaway|dinein|delivery|qr` con default `takeaway`.
- [x] 1.2 Extender `models/order.js` (`toOrderDocument`): campos `number`, `orderType`, `paymentStatus` (default `pending`), `paymentMethod` (solo cuando se paga).
- [x] 1.3 Agregar contador `nextOrderNumber` (default 1) al modelo de sucursal.
- [x] 1.4 En `services/orderService.js`: validar que el `paymentMethod` esté en `branch.paymentMethods`; asignar el `number` secuencial vía `findOneAndUpdate` con `$inc` sobre `branch.nextOrderNumber`; exigir sesión de caja abierta cuando llega `paymentMethod` (409 si no hay); permitir creación por `sysadmin`.
- [x] 1.5 En `services/orderService.js`: tras crear un pedido pagado, incrementar `totals.<method>` y `orderCount` de la sesión abierta de la sucursal (`$inc`), logueando si la sesión ya no está abierta.
- [x] 1.6 Mapear `ConflictError` (409) en `controllers/orderController.js` si no está.

## 2. Backend: sesiones de caja

- [x] 2.1 Crear `models/cashSession.js` con `toCashSessionDocument` (tenantId, branchId, openedBy, openedAt, openingAmount, status `open`, totals `{cash,debit,credit,transfer}`, orderCount, closedAt/closedBy null).
- [x] 2.2 Crear `validation/cashSessionSchemas.js`: apertura con `branchId` (ObjectId) y `openingAmount` >= 0.
- [x] 2.3 Crear `repositories/cashSessionRepository.js`: `create`, `findOpenByBranch`, `incrementTotals`.
- [x] 2.4 Crear `services/cashSessionService.js`: apertura (rechaza segunda sesión abierta en la misma sucursal con 409), consulta de la sesión abierta actual.
- [x] 2.5 Crear `routes/cash-sessions.js` + `controllers/cashSessionController.js` (`POST /api/cash-sessions`, `GET /api/cash-sessions/current?branchId=`), registrarlos en la app.
- [x] 2.6 Migración MongoDB: crear colección `cash-sessions` con índices (`tenantId`, `branchId`+`status`); índice único compuesto `(tenantId, foodtruckId, number)` en `orders`; inicializar `nextOrderNumber` en sucursales existentes.

## 3. Backend: metadatos de plato y acceso de lectura

- [x] 3.1 Extender `validation/dishSchemas.js`: `category` y `icon` opcionales en create/update.
- [x] 3.2 Extender `models/dish.js` (`toDishDocument`): defaults `category: "general"` e `icon: "🍽️"`.
- [x] 3.3 En `services/dishService.js` y `controllers/dishController.js`: permitir listar platos a `cashier` (solo su tenant, solo lectura) y a `sysadmin` (vía `tenantId`); mantener las guardas de creación/actualización/eliminación.
- [x] 3.4 Incluir `category` e `icon` en las respuestas de listado.

## 4. Backend: métodos de pago de sucursal y acceso de lectura

- [x] 4.1 Extender `validation/branchSchemas.js`: `paymentMethods` array de `cash|debit|credit|transfer`, default las cuatro.
- [x] 4.2 Extender `models/branch.js`: persistir `paymentMethods` (default completo) y devolverlo en respuestas.
- [x] 4.3 En `branchService`/`branchController`: permitir a `cashier` listar solo las sucursales activas de su tenant (solo lectura); sin cambios en las guardas de escritura.

## 5. frontend-admin: formularios

- [x] 5.1 Formulario de plato: campos `category` e `icon` (opcionales).
- [x] 5.2 Formulario de sucursal: checkboxes de métodos de pago (efectivo, débito, crédito, transferencia).

## 6. frontend-pos: scaffolding

- [x] 6.1 Crear proyecto Angular 21 standalone con SCSS (`ng new frontend-pos`).
- [x] 6.2 `environments/environment.ts` (+prod) con `apiUrl` y `turnstileSiteKey`.
- [x] 6.3 Servicios API espejo del admin: `auth`, `tenants`, `branches`, `dishes`, `orders`, `cash-sessions` (tipos e interfaces).
- [x] 6.4 Guards (`authGuard`, prerrequisito tenant/branch) e interceptor HTTP de token.
- [x] 6.5 `_tokens.scss` con los tokens de `pos.html` y componentes base: header (brand, reloj, badge de caja), modales, overlay, toast.

## 7. frontend-pos: login y selectores de contexto

- [x] 7.1 Página de login con Turnstile; `cashier/admin/owner` → POS; `sysadmin` → tenant-picker.
- [x] 7.2 `tenant-picker` (solo sysadmin) y `branch-picker`; persistir `pos_tenant` y `pos_branch` en localStorage.
- [x] 7.3 Saltar selectores según contexto: una sola sucursal activa → POS directo; recuperar selección persistida al recargar.

## 8. frontend-pos: pantalla POS

- [x] 8.1 Catálogo por categorías (agrupado por `category` con `icon`), búsqueda por nombre, precio de sucursal, ocultar inactivos.
- [x] 8.2 Carrito: agregar plato (modal con cantidad y observación), cambiar cantidad, editar nota, eliminar, subtotal/total; cobrar deshabilitado con carrito vacío.
- [x] 8.3 Modal de cliente y tipo de pedido (`takeaway` default, `dinein`, `delivery`, `qr`) → `orderType` + `clientContact`.
- [x] 8.4 Modal de pago: solo métodos de la sucursal; efectivo con monto recibido y vuelto (bloquear si insuficiente); débito/crédito/transferencia con aprobación simulada.
- [x] 8.5 Crear pedido con `stockApplied: true` en todos los items; mostrar warnings de stock insuficiente; al confirmar, carrito nuevo.

## 9. frontend-pos: caja

- [x] 9.1 Pantalla de caja: apertura con monto (si no hay sesión) y resumen (apertura, totales por método, conteo de ventas) cuando hay sesión abierta.
- [x] 9.2 Gate de cobro: sin sesión abierta, bloquear el pago y mostrar prompt para abrir caja.

## 10. Docker y validación

- [x] 10.1 Dockerfile de `frontend-pos` (target dev) y servicio `angular_pos` en `docker-compose.yml` (puerto 4201, env_file, volumes).
- [x] 10.2 Validar: `openspec validate`, build del frontend-pos, smoke test de endpoints (login, apertura de caja, pedido pagado, numeración, métodos de sucursal, listado cashier).