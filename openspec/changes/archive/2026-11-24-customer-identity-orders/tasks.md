## 1. Backend (@backend)

- [x] 1.1 Agregar `name` requerido (trim, min 1) al esquema de creación de pedido público en `src/validation/publicSchemas.js` y verificar que `npm test` pasa con los casos de validación
- [x] 1.2 Actualizar `publicService.createPublicOrder` para recibir `name`, guardar `clientName` en la orden y pasarlo a `upsertCustomer`, y verificar con una llamada a `POST /api/public/orders` que la orden devuelta persiste `clientName` y `clientPhone`
- [x] 1.3 Persistir `name` del cliente en `customerService.upsertCustomer` (sin resetear `pointsBalance`) y verificar que al crear un pedido QR el registro del cliente conserva el nombre y los puntos
- [x] 1.4 Asegurar que la capa de persistencia/detección de la orden (`orderRepository.createOrder` y `toOrderDocument`) guarde `clientName` opcional y verificar que una orden existente sin `clientName` sigue creándose

## 2. Frontend-client (@frontend-client)

- [x] 2.1 Ampliar `CreateOrderInput` con `name` en `public-api.service.ts` y verificar que compila con `npx tsc --noEmit -p tsconfig.app.json`
- [x] 2.2 En `OrderStore` agregar estado de `name` persistido por tenant (misma semántica que `phone`) y verificar que `name` y `phone` se rellenen al volver a la sucursal
- [x] 2.3 Agregar input de nombre al paso `phone` de `OrderFlowView` con validación (no vacío, límite de caracteres) y que el botón quede habilitado solo con nombre + teléfono válidos
- [x] 2.4 Enviar `name` en `submitOrder` y verificar de extremo a extremo contra `@backend` local que aparece en la pantalla de éxito con el número y los puntos

## 3. Frontend-pos (@frontend-pos KDS)

- [x] 3.1 Agregar `clientName?: string` a la interfaz `Order` en `orders.service.ts` y verificar compilación
- [x] 3.2 Mostrar en `kds.html` el nombre y teléfono del cliente junto al tipo de pedido en cada tarjeta (quién y cómo pidió), y verificar que aparece para pedidos QR y no rompe tarjetas sin `clientName`
- [x] 3.3 Mostrar `clientName` + `clientPhone` en el detalle/alerta POS de pedidos `qr` si el checkout lo requiere, y verificar visualmente con una orden QR de pago pendiente

## 4. Validación transversal

- [x] 4.1 Levantar `@backend`, `@frontend-client` y `@frontend-pos` juntos y verificar el flujo completo: QR → nombre + teléfono → menú → carrito → pedido → visible en KDS con quién y cómo pidió
- [x] 4.2 Ejecutar `openspec validate customer-identity-orders --type change --strict` y documentar en el resumen del cambio los resultados