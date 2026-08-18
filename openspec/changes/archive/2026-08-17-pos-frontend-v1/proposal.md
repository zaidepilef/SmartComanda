## Why

El sistema solo cuenta con `frontend-admin` y una vista de checkout básica (lista de platos sin categorías, sin cobro, sin experiencia POS), mientras que el diseño operativo validado vive en el prototipo `pos.html` (kiosco de 3 columnas, tema oscuro, cobro simulado, caja con apertura). Se necesita un SPA dedicado `frontend-pos` que materialice ese diseño contra la API real, para que cashiers, admins y owners tomen pedidos y cobren de forma rápida desde una pantalla táctil.

## What Changes

- **Nueva app Angular `frontend-pos`** (hermana de `frontend-admin`, misma API, estilo visual de `pos.html`): login, selección de tenant/sucursal, pantalla POS de 3 columnas (categorías | productos | pedido), modal de cliente y tipo de pedido, cobro simulado por método, pantalla de caja con apertura.
- **Login**: `cashier`, `admin` y `owner` entran directo al POS de su tenant; `sysadmin` elige con qué tenant operar y luego la sucursal. Captcha Turnstile como en el admin.
- **Pedido con pago**: el modelo de pedido gana `paymentMethod` (`cash|debit|credit|transfer`), `paymentStatus` (`pending|paid`), `orderType` (default `takeaway`) y un número secuencial por sucursal (`number`). Cobrar requiere sesión de caja abierta en la sucursal.
- **Caja nivel 2 sin cierre**: nueva colección `cash-sessions` con apertura (monto inicial), totales por método y conteo de ventas. El cierre de caja queda fuera de alcance (spec futura).
- **Sucursal**: campo `paymentMethods` configurable (efectivo/crédito/débito/transferencia) en API y en el formulario del admin.
- **Plato**: campos opcionales `category` (default `general`) e `icon` (default `🍽️`) en API y en el formulario del admin.
- **Docker**: nuevo servicio `angular_pos` (puerto 4201).
- La visualización de pedidos/ventas en `frontend-admin` NO está en alcance (spec futura). Tampoco KDS cocina, boleta/ticket ni Mercado Pago.

## Capabilities

### New Capabilities
- `pos-login`: autenticación del POS con roles `cashier`, `admin`, `owner` y `sysadmin` (con selección de tenant y sucursal), incluyendo Turnstile.
- `pos-order-taking`: pantalla POS para tomar pedidos — catálogo por categorías, búsqueda, carrito, personalización (cantidad y observación), cliente y tipo de pedido, y cobro simulado con los métodos configurados en la sucursal.
- `pos-cash-session`: apertura de sesión de caja por sucursal y consulta de ventas del día por método (sin cierre aún).

### Modified Capabilities
- `order-checkout`: la creación de pedidos incorpora método de pago, estado de pago, tipo de pedido, número secuencial por sucursal y la exigencia de sesión de caja abierta para cobrar.
- `tenant-data-model`: el esquema de la colección `orders` se amplía (pago, tipo, número) y se agrega la colección `cash-sessions` con su migración e índices.
- `dish-recipes`: los platos ganan metadatos opcionales `category` e `icon` con valores por defecto.
- `branch-management`: las sucursales ganan `paymentMethods` configurable en API y en la pantalla admin.

## Impact

- **Backend**: `models/order.js`, `models/dish.js`, `models/branch.js`, nuevos `models/cashSession.js` + repositorio/ruta/controlador/servicio de caja; `validation/orderSchemas.js`, `validation/branchSchemas.js`, `validation/dishSchemas.js`, `validation/cashSessionSchemas.js`; `services/orderService.js` (número secuencial, actualización de sesión, validación de métodos); migración MongoDB para `cash-sessions` y campos nuevos de `orders`.
- **frontend-pos (nuevo)**: proyecto Angular 21 standalone con signals, SCSS con tokens de `pos.html`, servicios auth/tenants/branches/dishes/orders/cash-sessions, guards, páginas login, tenant-picker, branch-picker, POS y caja.
- **frontend-admin**: formulario de plato (category/icon) y de sucursal (paymentMethods).
- **Docker**: servicio `angular_pos` en `docker-compose.yml` y Dockerfile para `frontend-pos`.
- **Datos**: colección nueva `cash-sessions`; campos nuevos opcionales en `orders`, `dishes` y `branches` (sin migración destructiva).