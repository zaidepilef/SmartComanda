## 1. Backend: datos (clientes, lealtad, config tenant)

- [x] 1.1 Crear `models/customer.js` con `toCustomerDocument` (`tenantId`, `phone`, `firstName` opcional, `pointsBalance` default 0, timestamps).
- [x] 1.2 Crear `models/loyaltyTransaction.js` con `toLoyaltyTransactionDocument` (`tenantId`, `branchId`, `customerId`, `type` `earn`, `points`, `sourceOrderId`, `createdAt`).
- [x] 1.3 Extender `models/order.js` (`toOrderDocument`): campos opcionales `clientPhone` y `pointsAwarded`.
- [x] 1.4 Extender `models/tenant.js`: persistir `loyalty` opcional (`pointsPerAmount`, `currency` default `CLP`).
- [x] 1.5 Migración MongoDB `009_create_customers_and_loyalty.js`: crear `customers` (índice en `tenantId`, único compuesto `tenantId`+`phone`) y `loyalty-transactions` (índices en `customerId` y `sourceOrderId`).
- [x] 1.6 Crear `repositories/customerRepository.js` (`findByTenantAndPhone`, `upsert`, `incrementBalance`) y `repositories/loyaltyRepository.js` (`insertTransaction`, `sumByCustomer` opcional).
- [x] 1.7 Extensiones de zod en `validation/`: `publicSchemas.js` (menuQuery, createPublicOrder, balanceQuery, phone con formato básico) y `tenantSchemas.js` (`loyalty`).

## 2. Backend: API pública (menú y órdenes)

- [x] 2.1 Crear `services/publicService.js`: `getPublicMenu(tenantId, branchId)` (valida tenant/branch activos y pertenencia; resuelve precio con la misma lógica de `branchPrices` del POS; solo platos `active`, sin receta/stock) y `createPublicOrder` (item validation, precio server-side, orden `orderType:"qr"`, `paymentStatus:"pending"`, `stockApplied:false` en items, número secuencial vía contador de sucursal).
- [x] 2.2 Crear `controllers/publicController.js` y `routes/public.js`: `GET /api/public/menu`, `POST /api/public/orders`, `GET /api/public/customers/balance`; registrar en la app.
- [x] 2.3 Rate limiting en las rutas públicas (sin JWT; validación zod completa).
- [x] 2.4 Integrar `customerService.js`: upsert de cliente por `(tenantId, phone)` al crear orden; devolver al cliente `{number, total, pointsBalance, pointsRate}`.

## 3. Backend: acreditación de puntos al cobrar

- [x] 3.1 Crear `services/loyaltyService.js`: `getRule(tenantId)` (default off), `computePoints(total, rule)`, `awardForOrder(order, {tenantId, branchId})` con secuencia claim → ledger → `$inc` (según design decision 5).
- [x] 3.2 En `services/orderService.js`, en el flujo de cobro/pago: si `orderType === "qr"` y hay `clientPhone` y regla configurada → claim idempotente (`findOneAndUpdate` sobre `pointsAwarded`), ledger `earn`, `$inc` balance; log si el grant falla tras el claim.
- [x] 3.3 Escenarios sin acreditación: sin `clientPhone`, sin regla (`pointsPerAmount` ausente o 0), o tipos de pedido distintos de `qr`.

## 4. frontend-client: scaffolding

- [x] 4.1 Crear proyecto Angular 21 standalone con SCSS móvil (`ng new frontend-client`).
- [x] 4.2 `environments/environment.ts` (+prod) con `apiUrl` público.
- [x] 4.3 Servicios: `public-menu`, `public-orders`, `customer-balance` (tipos e interfaces).
- [x] 4.4 `_tokens.scss` móvil (paleta propia, no la del kiosco) y componentes base (header con nombre del negocio, lista de platos, carrito flotante, toasts).

## 5. frontend-client: flujo de pedido

- [x] 5.1 Ruta `/q/:tenantId/:branchId`: validar tenant/branch vía menú; pantalla de WhatsApp (formato +56/9 dígitos) con persistencia en localStorage por tenant.
- [x] 5.2 Menú agrupado por categoría con búsqueda y carrito (cantidades, subtotal, total).
- [x] 5.3 Confirmación: crear orden, pantalla de éxito con número de orden, total, "paga en caja" y puntos (ganados estimados y saldo vía balance).
- [x] 5.4 Manejo de errores (sucursal inactiva, plato no disponible) y bloquear confirmación con carrito vacío.

## 6. frontend-admin: QR de sucursal y regla de puntos

- [x] 6.1 Pantalla "QR de sucursal" en `branch-management`: muestra/imprime `{PUBLIC_URL}/q/{tenantId}/{branchId}` por sucursal (solo propias).
- [x] 6.2 Edición de `loyalty.pointsPerAmount` y `currency` en la pantalla de tenant (formulario + API).

## 7. frontend-pos: teléfono del cliente y badge de puntos

- [x] 7.1 Mostrar `clientPhone` del pedido cuando `orderType === "qr"`.
- [x] 7.2 Badge "+X puntos" en el modal de pago para pedidos QR elegibles (servicio que exponga la regla/rate).

## 8. Docker y validación

- [x] 8.1 Dockerfile de `frontend-client` (target dev) y servicio `angular_client` en `docker-compose.yml` (puerto 4202, env público).
- [x] 8.2 Validar: `openspec validate`, build del frontend-client, smoke test (menú público, creación de orden pública con número secuencial, acreditación idempotente al cobrar, saldo, config de puntos).