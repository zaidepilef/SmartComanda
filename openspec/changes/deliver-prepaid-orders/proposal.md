## Why

Antes del flujo de compra nuevo, la caja podía cobrar los domicilios de la app. En producción quedó al menos un pedido (#1) que se pagó en caja (transferencia) y ahora está `out_for_delivery`. El repartidor ve "Entregar y cobrar", pero la API responde 409 ("already paid or voided") y el pedido no se puede cerrar.

## What Changes

- `POST /api/orders/:id/deliver` acepta un domicilio `out_for_delivery` que ya está `paid`: lo marca `delivered` sin cobrar de nuevo, sin exigir caja abierta y sin tocar los totales de la caja. En ese caso `paymentMethod` es opcional y se ignora; el vuelto es 0.
- Un pedido `voided` o `refunded` sigue respondiendo 409.
- `@frontend-pos` (Reparto) muestra "Entregar (ya pagado)" para esos pedidos y entrega sin abrir el modal de cobro.

## Capabilities

### Modified Capabilities

- `delivery-dispatch`: el requisito "Collect payment on delivery" cubre la entrega de domicilios ya pagados.

## Impact

- **@backend** (`SmartComanda_api`): `deliverOrder`, `deliverOrderSchema`, Swagger y tests.
- **@frontend-pos** (`SmartComanda_pos`): vista Reparto y `OrdersService.deliver`.
- Sin migraciones.
