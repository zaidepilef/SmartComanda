## Why

Los pedidos por QR hoy solo capturan el teléfono del cliente (`phone`) y la cocina (KDS) no puede saber quién ni cómo pidió: las órdenes QR se ven sin nombre ni teléfono. Para que el local pueda identificar al cliente al despachar y acumular puntos correctamente, el pedido debe capturar nombre y teléfono, y la cocina debe mostrar quién pidió y de qué forma.

## What Changes

- El flujo de pedido por QR (`@frontend-client`) pasa a pedir **nombre y teléfono** del cliente antes de mostrar el menú, y los recuerda por tenant/branch (localStorage).
- `POST /api/public/orders` (`@backend`) acepta y valida `name` (además de `phone`) y lo persiste en la orden como `clientName`; al registrarse el cliente (`customer`), se guarda también su nombre.
- El KDS (`@frontend-pos`) muestra para cada orden el **nombre y teléfono** del cliente junto al tipo de pedido (quién y cómo pidió), incluidas las órdenes QR.
- El detalle de orden y listado admite tanto `clientName` como `clientPhone`.
- **BREAKING**: el payload público de creación de orden agrega obligatoriamente `name`; respuestas y documentos de orden expondrán `clientName`.

## Capabilities

### New Capabilities

Ninguna (cambia el comportamiento de capacidades existentes).

### Modified Capabilities

- `customer-order-flow`: el flujo de pedido del cliente captura nombre + teléfono, y la creación pública de pedido persiste `clientName` en la orden.
- `kitchen-display`: el KDS muestra quién pidió (nombre + teléfono) y cómo (tipo de pedido) en cada tarjeta de orden.

## Impact

- **@frontend-client** (`SmartComanda_client`): formulario de identificación (nombre + teléfono), persistencia por tenant, envío de `name` en `createOrder`.
- **@backend** (`SmartComanda_api`): `publicSchemas.js` (validación de `name`), `publicService.createPublicOrder` (guardar `clientName`), modelo `customer` (persistir nombre), `toOrderDocument`/`orderRepository` (persistir `clientName`).
- **@frontend-pos** (`SmartComanda_pos`): interfaz `Order` (exponer `clientName`), vista KDS (mostrar nombre + teléfono + tipo).
- **Specs OpenSpec** en el monorepo: delta de `customer-order-flow` y `kitchen-display`.