## Why

Hoy el cliente no puede pedir por sí mismo: solo el cajero toma pedidos en el POS (spec `order-checkout`) o vía WhatsApp (futuro). Se quiere que el cliente llegue al local, escanee un QR con su celular y arme su pedido al instante — sin instalar nada, sin crear cuenta — para pagar después en caja. Ese mismo flujo habilita una base de lealtad: acumular puntos por monto gastado y mostrar el saldo, preparando el terreno para canje, promos exclusivas e integración con WhatsApp.

## What Changes

- **Nueva app Angular `frontend-client`** (hermana de `frontend-pos`, misma API, UX móvil): el QR de la sucursal abre `/q/:tenantId/:branchId`, pide el WhatsApp del cliente (sin verificar en v1), muestra el menú de esa sucursal, arma el pedido y confirma con el número de orden y "pagá en caja". Puntos ganados y saldo visible en la confirmación.
- **QR por sucursal**: URL pública imprimible `{PUBLIC_URL}/q/{tenantId}/{branchId}`, generada y mostrada desde el panel admin. El QR lo escanea la cámara nativa del celular (no hay escáner in-app).
- **API pública de solo lectura/menú**: `GET /api/public/menu?tenantId&branchId` devuelve platos activos con precio de sucursal, sin auth de usuario (valida tenant y sucursal activos y pertenencia).
- **Pedido como cliente**: `POST /api/public/orders` crea la orden con `orderType: "qr"`, `paymentStatus: "pending"` (paga en caja, sin integración de pago digital), `clientPhone` y items con `stockApplied: false`.
- **Lealtad — acumulación de puntos**: nuevas colecciones `customers` (`tenantId`, `phone`, `pointsBalance`) y `loyalty-transactions` (ledger inmutable). Regla configurable por tenant (`loyalty.pointsPerAmount`, ej. `$1000 = 1 punto`). Al cobrar en caja una orden `qr` con teléfono, se acreditan `floor(total / pointsPerAmount)` puntos de forma idempotente (flag `pointsAwarded` en la orden).
- **Admin**: pantalla "QR de sucursal" y edición de la regla de puntos del tenant. **POS**: muestra el teléfono del cliente en pedidos QR y un badge "+X puntos" al cobrar.
- `clientContact` sigue siendo string (sin cambios en POS); el teléfono estructurado viaja en `clientPhone`.

## Capabilities

### New Capabilities
- `public-menu`: API pública de menú por sucursal (solo lectura, sin auth de usuario, platos activos con precio de sucursal).
- `customer-order-flow`: flujo del cliente — QR que abre la sesión única (visita), WhatsApp como identidad sin verificar, pedido `qr` pendiente de pago en caja, app `frontend-client`, pantalla admin del QR por sucursal, y visualización del teléfono en el POS.
- `loyalty-points`: clientes y puntos — colecciones `customers` y `loyalty-transactions`, regla por monto configurable por tenant, acreditación idempotente al cobrar en caja, saldo visible en la app del cliente, edición de la regla en el admin y badge de puntos en el POS.

### Modified Capabilities
- `tenant-data-model`: la colección `orders` gana `clientPhone` y `pointsAwarded`; se agregan `customers` y `loyalty-transactions` con índices; el documento `tenants` gana la config `loyalty`.
- `branch-management`: el panel por sucursal permite generar/ver el QR público imprimible de la sucursal.

## Impact

- **Backend**: `models/customer.js`, `models/loyaltyTransaction.js`, `models/order.js` (nuevos campos), `models/tenant.js` (config `loyalty`); nuevos `repositories/customerRepository.js` y `loyaltyRepository.js`; nuevos `services/publicService.js` (o menú/órdenes), `customerService.js` y `loyaltyService.js`; rutas `public` (`/api/public/menu`, `/api/public/orders`, saldo del cliente); hook de acreditación en `services/orderService.js` al cobrar; validaciones nuevas en `validation/`; migración MongoDB `009_create_customers_and_loyalty.js`.
- **frontend-client (nuevo)**: proyecto Angular 21 standalone con signals y SCSS móvil, rutas `/q/:tenantId/:branchId`, servicios públicos (menú, órdenes, saldo), sin login ni Turnstile.
- **frontend-admin**: pantalla de QR por sucursal y edición de `loyalty.pointsPerAmount` del tenant.
- **frontend-pos**: el modal de pedido muestra el teléfono del cliente para pedidos QR; al cobrar un pedido `qr` con teléfono se muestra "+X puntos".
- **Docker**: servicio `angular_client` en `docker-compose.yml` (puerto 4202, env público).
- **Datos**: colecciones nuevas `customers` y `loyalty-transactions`; campos nuevos opcionales en `orders` y `tenants` (sin migración destructiva).