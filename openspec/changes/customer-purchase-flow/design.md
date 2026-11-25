## Context

- `orders` ya separa `status` (`new → preparing → ready → delivered`, `cancelled`) de `payment_status` (`pending`, `paid`, `refunded`), guarda `status_history`, `paid_by` y los datos de entrega (`017_add_delivery_to_orders.js`).
- `isCustomerAppOrder` (`models/order.js`) trata igual a `qr` y a `delivery` con dirección: ambos deben cobrarse antes de `preparing`, y el filtro `kitchen` de `orderRepository` los oculta mientras están `pending`.
- `customers` es único por `(tenant_id, phone)` y guarda `first_name` y `points_balance`. `PHONE_PATTERN` acepta cualquier número de 9 a 15 dígitos.
- `estimateDelivery` (`utils/geo.js`) es la única fuente de la estimación; `outOfRange` hoy es solo un aviso.
- El pedido público solo acepta `dishId` y `quantity`; el POS ya maneja notas por ítem.
- Roles actuales: `sysadmin`, `owner`, `admin` (Encargado), `cashier`, `cook`, con la matriz en `utils/permissions.js`.

## Goals / Non-Goals

**Goals:**
- Que el cliente que vuelve no reingrese datos: modalidad → teléfono → saludo → dirección sugerida (en domicilio) → menú.
- Respetar las dos reglas de cobro: retiro paga antes de cocina; domicilio paga al recibir.
- Dar al repartidor lo necesario para entregar y cobrar, con trazabilidad de quién cobró.
- Evitar pedidos duplicados y domicilios fuera de cobertura.

**Non-Goals:** pagos en línea, costo de envío, modificadores con precio, verificación por WhatsApp, rendición de caja por repartidor, seguimiento GPS.

## Decisions

1. **Un solo ciclo de estados, con un estado nuevo.** Se agrega `out_for_delivery` y se mantienen los existentes. Transiciones: `ready → out_for_delivery → delivered` para domicilios de la app; `ready → delivered` para el resto. Las etiquetas por modalidad ("Pendiente de pago", "Listo para retirar", "Listo para despacho", "En reparto") se calculan en el frontend a partir de `status` + `paymentStatus` + `orderType`. *Descartado*: dos máquinas de estado separadas, porque obligaría a reescribir POS, cocina, admin y reportes.

2. **La regla de cocina depende de la modalidad.** `isCustomerAppOrder` se divide en `isAppPickupOrder` (`qr`) y `isAppDeliveryOrder` (`delivery` con dirección). Solo el retiro exige `paid` para pasar a `preparing`; el filtro de cocina oculta solo `qr` + `pending`.

3. **Estado de pago con historial.** `payment_status` admite `pending`, `paid`, `declined`, `voided`, `refunded`. Transiciones: `pending → paid | declined | voided`, `declined → paid | voided`, `paid → refunded` (reservado, sin endpoint). Cada cambio agrega una entrada a la nueva columna `payment_history` (JSONB: `status`, `method`, `at`, `by`, `note`). La creación pública siempre guarda `pending`: ningún camino de la app puede guardar `paid`.

4. **Medio de pago esperado ≠ pago.** Columnas nuevas `expected_payment_method` (`cash`, `debit`, `credit`, `card`) y `cash_tendered`. `card` significa "débito o crédito, lo decide en la puerta" y solo existe como intención; el cobro real registra `debit` o `credit` en `payment_method`. El medio esperado debe estar habilitado en la sucursal (`card` exige `debit` o `credit`). `cash_tendered`, si viene, debe ser ≥ total.

5. **Cobro con entrega atómico.** `POST /api/orders/:id/deliver` con `paymentMethod` (`cash`, `debit`, `credit`) y `cashReceived` opcional: en una transacción bloquea el pedido, exige `out_for_delivery` y pago `pending` o `declined`, registra el cobro en la caja abierta de la sucursal (`recordSale`, `paid_by` = repartidor) y pasa a `delivered`. Sin caja abierta responde 409 con un mensaje para avisar al Encargado. `POST /api/orders/:id/payment-declined` registra un rechazo del POS sin cambiar el estado operativo. Los puntos de fidelidad se otorgan igual que al cobrar en caja: `awardForOrder` se extiende a los domicilios de la app.

6. **Repartidor = rol `driver`.** Permisos nuevos `order.dispatch` (tomar y entregar) y `order.collect` (cobrar en la entrega). El `driver` ve solo los domicilios de la app de su sucursal en `ready` o `out_for_delivery`. Toma un pedido con `ready → out_for_delivery`, que guarda `driver_id`. Encargado o superior pueden reasignar. Solo el repartidor asignado o Encargado o superior pueden entregar y cobrar.

7. **Búsqueda pública con datos mínimos.** `POST /api/public/customers/lookup` (POST para que el teléfono no quede en URLs ni logs de acceso) devuelve `{ known, firstName, addresses: [{ id, label }], lastAddressId }`. `label` enmascara la dirección: la calle y los primeros dígitos del número, seguidos de "…", sin referencia ni coordenadas. Rate limit propio más estricto (por IP y por teléfono). Para usar una dirección guardada, el pedido envía `delivery.addressId`; el servidor la resuelve con sus coordenadas y recalcula la cobertura. *Riesgo aceptado*: quien conozca un teléfono ve el primer nombre; se mitigará con verificación por WhatsApp en un cambio futuro.

8. **Direcciones guardadas.** Tabla `customer_addresses` (`id`, `tenant_id`, `customer_id`, `address`, `reference`, `lat`, `lng`, `last_used_at`, `created_at`). Al crear un domicilio con dirección nueva se inserta; si coincide (mismo texto normalizado o a menos de 30 m) se reutiliza y se actualiza `last_used_at`. Máximo 5 por cliente: la menos usada se elimina. Índice por `(customer_id, last_used_at DESC)`.

9. **Cobertura obligatoria.** `outOfRange` pasa a bloquear: `POST /api/public/orders` responde 422 `DELIVERY_OUT_OF_RANGE` y la app ofrece retiro. Un domicilio exige coordenadas (GPS o marcador arrastrado en el mapa si se niega el permiso). Una sucursal ofrece domicilio solo si tiene `lat`/`lng` y al menos `deliveryMaxKm` o `deliveryMaxMinutes`. El menú público expone `deliveryAvailable`.

10. **Idempotencia.** La app genera un `clientRequestId` (UUID v4) al llegar al resumen y lo reutiliza en los reintentos. Índice único parcial `(tenant_id, client_request_id) WHERE client_request_id IS NOT NULL`. Si el id ya existe para el mismo teléfono se devuelve el pedido existente con 200; si es de otro teléfono, 409. El número de pedido se pide al contador solo después de comprobar que el id no existe, dentro de la misma transacción.

11. **Teléfono chileno.** El formato canónico es `+569` seguido de 8 dígitos. El servidor normaliza `9XXXXXXXX`, `569XXXXXXXX` y `+569XXXXXXXX` y rechaza el resto. Una migración normaliza `customers.phone` y `orders.client_phone`. Si dos clientes del mismo tenant quedarían con el mismo teléfono, no se fusionan: se registran en el log de la migración para revisarlos a mano.

12. **Nota por ítem.** El pedido público acepta `note` por ítem (máx. 140 caracteres, texto plano), que se guarda como en el POS. Angular escapa la salida; el backend recorta y quita caracteres de control.

13. **Seguimiento con token, no con el número.** El número de pedido es secuencial por sucursal y se puede adivinar, así que no basta para consultar. Al crear el pedido se genera `tracking_token` (32 bytes aleatorios en base64url, guardado como hash SHA-256 en `orders.tracking_token_hash`) y se devuelve una sola vez. La app guarda un comprobante del pedido activo en localStorage, uno por tenant y sucursal (`number`, `trackingToken`, `phone`, `mode`), y abre `/q/:tenantId/:branchId/pedido/:number`. Ese comprobante es la "sesión" del cliente: mientras el pedido está activo, recargar o volver a escanear el QR abre directo el seguimiento; al llegar a un estado final (o si el servidor no reconoce el token) se borra y se ofrece "Hacer otro pedido". No hay sesión en el servidor ni cookie: el token basta y no da acceso a nada más que ese pedido. El seguimiento muestra junto al estado un indicador de pago a partir de `paymentStatus` ("Por pagar $X al recibir / en caja" o "Pagado ✓"). `POST /api/public/orders/track` (token en el cuerpo, nunca en la URL) devuelve solo número, modalidad, estado visible al cliente, total, medio de pago esperado, minutos estimados, motivo de rechazo y marcas de tiempo; nunca dirección, teléfono ni datos de otros pedidos. La app consulta cada 15 s mientras el pedido está activo y deja de consultar al llegar a un estado final. `POST /api/public/orders/track` tiene un rate limit propio por IP (1200 por 15 min) y no cuenta para el límite general de `/api/public`, porque varios clientes en la misma red wifi consultan a la vez. *Descartado*: consultar por número + teléfono (enumerable con teléfonos conocidos).

14. **Estado visible al cliente.** Se calcula en el backend (`customerFacingStatus`) para que la app no replique reglas: `received` (domicilio `new`), `awaiting_payment` (retiro `new` + `pending`), `preparing`, `ready_for_pickup`, `ready_for_dispatch`, `out_for_delivery`, `delivered`, `rejected`, `cancelled`.

15. **Rechazo ≠ anulación.** `rejected` es un estado operativo nuevo, terminal, alcanzable solo desde `new` y solo en pedidos de la app. `POST /api/orders/:id/reject` exige `reason` (3 a 200 caracteres) y lo pueden usar `cashier`, `admin`, `owner` y `sysadmin` (permiso `order.reject`). Guarda `rejection_reason`, `rejected_by`, agrega la entrada al `status_history` y pone el pago en `voided`. La anulación (`cancelled`) sigue siendo exclusiva de Encargado o superior y aplica a cualquier pedido. Para evitar confusión, el cobro con tarjeta rechazado en la puerta se llama `declined` en el estado de pago.

16. **Pago contra entrega explícito.** En domicilio el resumen muestra "Pagas al recibir tu pedido" sobre la selección del medio, el botón dice "Confirmar pedido · pagas $X al recibir" y la confirmación y el seguimiento lo repiten. No se ofrece transferencia en domicilio aunque la sucursal la tenga habilitada.

## Risks / Trade-offs

- **Cambio de regla en cocina**: al desplegar, los domicilios pendientes que ya existan aparecerán en cocina → se despliega en horario sin servicio y se revisan los pedidos abiertos.
- **Exposición del nombre por teléfono** → se muestra solo el primer nombre, con direcciones enmascaradas y rate limit; la verificación queda como siguiente paso.
- **Caja compartida**: el efectivo del repartidor suma a la caja de la sucursal, que debe estar abierta mientras haya repartos → el tablero lo advierte antes de salir; la rendición por repartidor queda para después.
- **Token de seguimiento perdido** (otro teléfono o borrado del navegador): el cliente no puede ver el seguimiento, pero conserva el número para preguntar en el local. Recuperarlo por WhatsApp queda para después.
- **Normalización de teléfonos** puede encontrar duplicados → se reportan y no se fusionan solos.
- **Orden de despliegue**: primero `@backend` (migraciones), después POS (tablero y cocina), cliente y admin. El cliente antiguo dejará de crear pedidos porque falta `clientRequestId`, así que el cliente se despliega inmediatamente después de la API.

## Migration Plan

1. `018_create_customer_addresses.js`.
2. `019_purchase_flow_orders.js`: `expected_payment_method`, `cash_tendered`, `client_request_id` + índice único parcial, `driver_id` (FK `users`, `ON DELETE SET NULL`), `customer_address_id`, `payment_history JSONB DEFAULT '[]'`, índice `(foodtruck_id, status) WHERE order_type = 'delivery'`.
3. `020_add_driver_role.js`: rol `driver` con nombre visible "Repartidor".
4. `021_normalize_customer_phones.js`: normalización con reporte de choques.
5. `022_order_tracking_and_rejection.js`: `tracking_token_hash` (índice único), `rejection_reason`, `rejected_by`, `rejected_at`.

Rollback: las columnas son aditivas; revertir el código vuelve al comportamiento anterior. El estado `out_for_delivery` de pedidos en curso se pasaría a `ready` a mano.
