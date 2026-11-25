## 0. Prerrequisitos

- [x] 0.1 Verificar y archivar `pos-roles-and-cash`, `customer-identity-orders` y `delivery-location-estimate` (tareas manuales pendientes en los dos últimos)
- [ ] 0.2 Confirmar `develop` actualizado en monorepo, `@backend`, `@frontend-client`, `@frontend-pos` y `@frontend-admin`

## 1. Backend (`@backend`)

- [x] 1.1 Migración `018_create_customer_addresses.js` (tabla, FK a `customers`, índice `(customer_id, last_used_at DESC)`)
- [x] 1.2 Migración `019_purchase_flow_orders.js`: `expected_payment_method`, `cash_tendered`, `client_request_id` + índice único parcial, `driver_id`, `customer_address_id`, `payment_history`, índice de reparto
- [x] 1.3 Migración `020_add_driver_role.js` (rol `driver`, "Repartidor")
- [x] 1.4 Migración `021_normalize_customer_phones.js` con reporte de choques, sin fusionar
- [x] 1.5 `utils/phone.js`: normalizar/validar `+569XXXXXXXX`, con tests; usarlo en `publicSchemas`
- [x] 1.6 `models/order.js`: estado `out_for_delivery`, transiciones por modalidad, estados de pago y sus transiciones, `isAppPickupOrder` / `isAppDeliveryOrder`
- [x] 1.7 `orderService.updateOrderStatus` y filtro `kitchen`: solo `qr` pendiente espera el cobro; domicilio entra con pago pendiente
- [x] 1.8 `payment_history` en cobro, rechazo y anulación; anular sin cobro → `voided`
- [x] 1.9 `permissions.js`: `order.dispatch`, `order.collect`, rol `driver`; listado acotado a domicilios para `driver`
- [x] 1.10 Endpoints de reparto: tomar pedido (bloqueo optimista), asignar/reasignar, `POST /orders/:id/deliver` (transacción con caja y puntos), `POST /orders/:id/payment-declined`
- [x] 1.11 `customerRepository`/`customerService`: direcciones guardadas (reutilizar por texto o < 30 m, máximo 5), primer nombre, actualización de nombre
- [x] 1.12 `POST /api/public/customers/lookup` con etiquetas enmascaradas y rate limit propio por IP y por teléfono
- [x] 1.13 `createPublicOrder`: `clientRequestId` idempotente, `expectedPaymentMethod`/`cashTendered` validados contra la sucursal, `note` por ítem, `addressId`, cobertura obligatoria (422)
- [x] 1.14 Menú público con `paymentMethods` y `deliveryAvailable`
- [x] 1.15 Migración `022_order_tracking_and_rejection.js`: `tracking_token_hash` (único), `rejection_reason`, `rejected_by`, `rejected_at`
- [x] 1.16 Estado `rejected` en `models/order.js`; `POST /api/orders/:id/reject` con motivo (permiso `order.reject`, pago → `voided`)
- [x] 1.17 `tracking_token` al crear el pedido (devuelto una vez, guardado como hash), `customerFacingStatus` y `POST /api/public/orders/track` sin datos personales
- [x] 1.18 Swagger y tests (servicio, repositorio y rutas) para todo lo anterior

## 2. Cliente (`@frontend-client`)

- [x] 2.1 Reestructurar `order-flow` en pasos con navegación hacia atrás que conserva el carrito
- [x] 2.2 Paso modalidad como primera pantalla, según `deliveryAvailable`
- [x] 2.3 Paso teléfono: prefijo fijo `+569`, `inputmode="numeric"`, 8 dígitos, solo números
- [x] 2.4 Paso bienvenida/nombre con lookup, "¡Qué rico volver a verte, {nombre}!" y "¿No eres tú?"
- [x] 2.5 Paso dirección: sugerir la última, listar las guardadas, nueva con GPS o marcador manual; bloqueo fuera de cobertura con opción de retiro
- [x] 2.6 Nota por ítem en el detalle del producto y en el carrito
- [x] 2.7 Resumen con total, medio de pago esperado según modalidad y sucursal, "pago con" y vuelto, aviso de que elegir no es pagar
- [x] 2.8 `clientRequestId` por confirmación, botón deshabilitado durante el envío y reintento seguro
- [x] 2.9 Confirmación distinta para retiro y domicilio; manejo de los errores 422/409
- [x] 2.10 Pago contra entrega explícito en domicilio: "Pagas al recibir tu pedido", sin transferencia, botón "Confirmar pedido · pagas $X al recibir"
- [x] 2.11 Pantalla de seguimiento `/pedido/:number` con línea de tiempo, indicador "Por pagar $X (al recibir / en caja)" o "Pagado ✓", consulta cada 15 s y fin al llegar a un estado final; motivo cuando el local rechaza
- [x] 2.12 Comprobante del pedido activo en localStorage por tenant/sucursal (`number`, `trackingToken`, `phone`, `mode`); al recargar o volver a escanear el QR se abre directo el seguimiento; al llegar a un estado final o con token desconocido se borra y se ofrece "Hacer otro pedido"
- [x] 2.13 Eventos de journey para los pasos nuevos (sin datos personales): `mode_selected`, `customer_looked_up`, `address_confirmed`, `address_out_of_range`, `summary_opened`; etiquetas en el visor del admin

## 3. POS (`@frontend-pos`)

- [x] 3.1 Etiquetas de estado por modalidad y estado de pago (servicio compartido)
- [x] 3.2 Cocina: domicilios con pago pendiente visibles con el distintivo "Paga al recibir"; ocultar `out_for_delivery`; mostrar notas
- [x] 3.3 Cola QR: preseleccionar el medio de pago esperado
- [x] 3.4 Pantalla "Reparto": listos / en reparto, datos de entrega, llamar, mapa, total, vuelto, salir a reparto, aviso de caja cerrada
- [x] 3.5 Cobro con entrega (efectivo con monto recibido, débito, crédito) y registro de cobro rechazado
- [x] 3.6 Acción "Rechazar" con motivo obligatorio en la cola QR y en las tarjetas de domicilio `new` de cocina (Cajero y superiores)
- [x] 3.7 Menú y rutas para `driver` (solo Reparto); asignación por Encargado

## 4. Admin (`@frontend-admin`)

- [x] 4.1 Rol "Repartidor" en el alta y la edición de usuarios
- [x] 4.2 Detalle y listado de pedidos: estado `out_for_delivery`, estados de pago nuevos, medio esperado, repartidor, historial de pagos
- [x] 4.3 Filtros por los estados nuevos (incluido `rejected`) y motivo de rechazo en el detalle

## 5. Verificación

- [ ] 5.1 Tests del backend en verde; builds de cliente, POS y admin
- [ ] 5.2 Retiro de punta a punta: teléfono nuevo → nombre → retiro → menú → resumen → pedido → cola QR → cobro → cocina → listo → entregado
- [ ] 5.3 Domicilio de punta a punta con cliente conocido: saludo → dirección sugerida → pedido → cocina sin cobro → listo → repartidor → cobro en efectivo con vuelto → entregado y pagado
- [ ] 5.4 Seguimiento: el cliente ve cada cambio de estado y de pago de su pedido, sigue en el seguimiento al recargar o reescanear, ve el motivo cuando el local lo rechaza; un token inventado no devuelve nada
- [ ] 5.5 Casos límite: fuera de cobertura, doble confirmación, tarjeta rechazada y luego efectivo, caja cerrada al entregar, repartidor ajeno, teléfono inválido
- [ ] 5.6 Revisar en el celular (modo emulado) teclado numérico, GPS denegado y marcador manual
