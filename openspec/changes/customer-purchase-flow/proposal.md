## Why

El comensal ya puede pedir por QR, elegir retiro o domicilio y ver una estimación de envío, pero el flujo no refleja cómo opera realmente un local de completos y sándwiches:

- Al cliente que vuelve se le piden otra vez nombre y teléfono, y sus direcciones no quedan guardadas.
- Un pedido a domicilio **no llega a cocina hasta que se cobra en caja**, pero en domicilio se cobra al entregar: el pedido debe prepararse con el pago pendiente.
- No existe el repartidor: nadie puede ver sus entregas ni registrar el cobro (efectivo o POS) en la puerta.
- Fuera de cobertura es solo un aviso, y el pedido no guarda cómo piensa pagar el cliente ni con cuánto paga en efectivo.
- Si el cliente confirma dos veces se crean dos pedidos, y los ítems no aceptan notas ("sin mayo").

## What Changes

- **Reconocimiento del cliente por teléfono**: la app pide primero el celular con `+569` precargado (8 dígitos, teclado numérico). Un endpoint público lo busca: si el cliente existe se le saluda ("¡Qué rico volver a verte, Ana!") y se le ofrecen sus direcciones guardadas, **enmascaradas**; si no, se le pide solo el nombre. Los teléfonos se normalizan a `+569XXXXXXXX`.
- **Direcciones guardadas**: nueva tabla `customer_addresses`. Cada pedido a domicilio guarda o reutiliza la dirección del cliente; el pedido puede referirse a una dirección guardada por `addressId`.
- **Cobertura obligatoria**: un domicilio fuera del radio de la sucursal, o en una sucursal sin ubicación o sin radio configurado, **se rechaza**. La app ofrece cambiar a retiro en local. El domicilio exige un punto en el mapa (GPS o marcador manual).
- **Medio de pago esperado**: el cliente indica cómo pagará (`cash`, `debit`, `credit` o `card` en domicilio) y, si es efectivo, con cuánto pagará. Esto es **solo una intención**: nunca marca el pedido como pagado.
- **Dos reglas de cobro**:
  - Retiro (`qr`): sigue igual; el cajero cobra y entonces pasa a cocina.
  - Domicilio (`delivery` desde la app): pasa a cocina al confirmarse, con el pago pendiente; lo cobra el repartidor al entregar.
- **Nuevo estado `out_for_delivery` ("En reparto")** entre `ready` y `delivered` para los domicilios de la app. Las pantallas muestran nombres según la modalidad ("Pendiente de pago", "Listo para retirar", "Listo para despacho").
- **Nuevo rol `driver` (Repartidor)** y un tablero de reparto en el POS: toma pedidos listos, ve dirección, teléfono, total, medio esperado y vuelto; registra el cobro (efectivo / débito / crédito) y la entrega en una sola acción, o registra un cobro rechazado.
- **Estado de pago ampliado**: `pending`, `paid`, `rejected`, `voided` (pedido anulado sin cobrar) y `refunded` (reservado). Cada cambio de pago queda en `payment_history`.
- **Pedidos sin duplicados**: el cliente envía un `clientRequestId`; repetir la confirmación devuelve el mismo pedido.
- **Nota por ítem** en el pedido público (personalización v1).
- **BREAKING**: `POST /api/public/orders` exige teléfono en formato `+569XXXXXXXX`, `clientRequestId`, `expectedPaymentMethod`, y para domicilio coordenadas (o `addressId`); rechaza domicilios fuera de cobertura. Los domicilios de la app ya no esperan el cobro para entrar a cocina.

## Capabilities

### New Capabilities

- `customer-recognition`: formato de teléfono chileno, búsqueda pública del cliente con datos mínimos y direcciones guardadas.
- `delivery-dispatch`: rol repartidor, tablero de reparto, salida a reparto y cobro con entrega.

### Modified Capabilities

- `customer-order-flow`: flujo por pasos (teléfono → bienvenida/nombre → modalidad → dirección → menú → resumen con medio de pago → confirmación), pedido público con idempotencia, notas, medio de pago esperado y cobertura obligatoria.
- `public-menu`: indica si la sucursal ofrece domicilio.
- `kitchen-display`: estado `out_for_delivery`; los domicilios de la app entran a cocina con pago pendiente.
- `order-checkout`: ciclo de vida del estado de pago, historial de pagos y anulación sin cobro como `voided`.
- `role-permissions`: rol `driver` y sus permisos.

## Non-goals

- Pagos en línea o pasarelas (Mercado Pago, KLAP): la estructura de pago queda lista para sumarlos.
- Costo de envío, zonas tarifarias o pago anticipado del domicilio.
- Agregados con precio (modificadores) por producto.
- Verificación del teléfono por WhatsApp, seguimiento GPS del repartidor, asignación automática y rendición de caja por repartidor.

## Dependencias

Este cambio se apoya en requisitos que aún viven en cambios sin archivar: `pos-roles-and-cash`, `customer-identity-orders` y `delivery-location-estimate`. **Deben verificarse y archivarse antes** de archivar este cambio, porque los deltas `MODIFIED` parten del texto que esos cambios dejan en las specs.

## Impact

- **@backend** (`SmartComanda_api`): migraciones (direcciones, campos nuevos de pedido, rol `driver`, normalización de teléfonos), `publicSchemas`, `publicService`, `customerService`/`customerRepository`, nuevo endpoint de búsqueda, `models/order.js` (estado, transiciones, estados de pago), `orderService` (entrada a cocina, salida a reparto, cobro con entrega), `orderRepository` (filtro de cocina, idempotencia), `permissions.js`, Swagger y tests.
- **@frontend-client** (`SmartComanda_client`): rediseño de `order-flow` por pasos, input de teléfono, bienvenida, direcciones guardadas, bloqueo por cobertura, resumen con medio de pago y vuelto, `clientRequestId`, notas por ítem.
- **@frontend-pos** (`SmartComanda_pos`): tablero de reparto para `driver`, nombres de estado por modalidad, cocina con domicilios pendientes de pago, medio de pago esperado en la cola QR.
- **@frontend-admin** (`SmartComanda_admin`): rol "Repartidor" en el alta de usuarios, nuevos estados y medio de pago esperado en el detalle de pedidos.
- **Datos**: teléfonos existentes en otros formatos se normalizan; los duplicados que choquen se reportan y no se fusionan automáticamente.
