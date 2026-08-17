## Why

La iteración 1 (change `pos-frontend-v1`) dejó el POS operativo: pedidos pagados con numeración, sesiones de caja con apertura y catálogo accesible para `cashier`. Para operar en producción faltan el cierre del ciclo financiero (caja), la visibilidad operacional (pedidos en el panel admin) y la comunicación con cocina (KDS) y cliente (boleta).

## What Changes

- **Cierre de caja con corte**: nuevo endpoint `POST /api/cash-sessions/:id/close` que cierra la sesión abierta de una sucursal, registrando arqueo por método de pago (`cash`, `debit`, `credit`, `transfer`), totales finales, conteo de ventas y diferencia vs. lo registrado. Rechaza cierre de sesión inexistente, de otro tenant o ya cerrada (409). Pantalla de caja en `frontend-pos` con flujo de arqueo y resumen final del corte.
- **Listado de pedidos en `frontend-admin`**: nuevo endpoint `GET /api/orders` con filtros (sucursal, tipo de pedido, estado, método de pago, rango de fechas, búsqueda por número/contacto) y acceso por rol (`cashier` solo su sucursal, `admin`/`owner` su tenant, `sysadmin` cualquier tenant). Nueva vista en el admin con tabla de pedidos, filtros y detalle expandible.
- **KDS (pantalla de cocina)**: ciclo de estados de pedido `new → preparing → ready → delivered` (+ `cancelled`), con endpoints `PATCH /api/orders/:id/status` y `GET /api/orders` para una sucursal; pantalla en `frontend-pos` (`/kds`) con polling, tarjetas por estado y avance de estado con un toque.
- **Boleta**: al confirmar un pedido pagado en el POS, vista de boleta imprimible (número de orden, sucursal, fecha, items con cantidades y observaciones, subtotal, método de pago, vuelto cuando aplica) generada en el cliente con `window.print()`. Sin backend adicional (los datos provienen de la respuesta del pedido).

## Capabilities

### New Capabilities
- `cash-session-closure`: cierre de la sesión de caja con arqueo por método, tot ales finales y diferencia; reglas de validación y errores.
- `order-listing`: listado y filtrado de pedidos por rol, con detalle por pedido, para el panel admin y el KDS.
- `kitchen-display`: ciclo de vida de estados del pedido y pantalla de cocina que lo opera.
- `order-receipt`: boleta imprimible de un pedido pagado.

### Modified Capabilities
<!-- Ninguna: el comportamiento existente de pedidos (order-checkout) y sesiones de caja (delta de pos-frontend-v1, no sincronizado a specs principales) no cambia; esta iteración agrega capacidades nuevas. -->

## Impact

- **Backend**: `orderRepository`/`orderService`/`orderController` (listado con filtros, `PATCH status`), `cashSessionService`/`cashSessionRepository` (close con arqueo), rutas `orders.js` y `cash-sessions.js`, migración `008` (índices en `orders`: `tenantId+foodtruckId+createdAt`, `status`). Sin cambios de esquema destructivos.
- **frontend-admin**: nueva vista `orders` (tabla, filtros, detalle) + servicio `orders.service.ts` + ruta con lazy loading.
- **frontend-pos**: pantalla `kds` con polling de pedidos de la sucursal; cierre de caja en `cash.ts` (arqueo + resumen del corte); boleta imprimible tras el pago; nuevos servicios (`orders.list`, `orders.updateStatus`, `cashSessions.close`).
- **Docker**: sin cambios (mismo servicio `angular_pos`).
- **Especs**: dependencia funcional del change abierto `pos-frontend-v1` (sesiones de caja y pedidos pagados); se documenta en `design.md`.
