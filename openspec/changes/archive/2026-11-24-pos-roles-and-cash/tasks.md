## 1. Backend: roles y permisos

- [x] 1.1 Migración `014_pos_roles_and_cash.js`: rol `cook` (Cocinero), "Encargado" para `admin`, columnas de pago/anulación/corrección en `orders`, `refunded` en `payment_status`, tabla `cash_session_closures` y `closing_note`
- [x] 1.2 Agregar `cook` a `USER_ROLES` y crear `auth/permissions.js` con la matriz y `requirePermission(action)`
- [x] 1.3 Aplicar `requirePermission` en `routes/orders.js`, `routes/cash-sessions.js` y `routes/users.js`
- [x] 1.4 `ASSIGNABLE_ROLES` en `userService` (owner → admin/cashier/cook; admin → cashier/cook) y anti-escalada al editar y crear

## 2. Backend: pedidos

- [x] 2.1 Cobro en transacción: `payOrder` y `createOrder` pagado guardan `cash_session_id` y `paid_at` con `FOR UPDATE`
- [x] 2.2 `POST /api/orders/:id/cancel` con motivo, reverso de totales en la caja de origen y 409 si esa caja está cerrada
- [x] 2.3 `PATCH /:id/status` rechaza `cancelled` (usar `/cancel`) y bloquea `new → preparing` para QR sin cobrar
- [x] 2.4 `PUT /api/orders/:id/items` para corregir pedidos `pending` + `new`, con precios del servidor (función común con `createOrder`)
- [x] 2.5 Filtro `kitchen=true` en `GET /api/orders` que excluye QR pendientes
- [x] 2.6 Swagger de los endpoints nuevos y modificados

## 3. Backend: caja

- [x] 3.1 `closeCashSession` persiste esperado, contado y diferencia por método, más la nota; efectivo esperado = apertura + efectivo
- [x] 3.2 `GET /current` y la sesión cerrada devuelven el arqueo y `openedBy`
- [x] 3.3 Tests (node:test): matriz por rol (403), anular con reverso, anular en caja cerrada (409), corregir antes y después de cobrar, cierre persistido, QR oculto en cocina, owner creando personal

## 4. POS

- [x] 4.1 `ROLE_LABELS`, menú y guards por rol (cocinero solo Cocina)
- [x] 4.2 Interceptor 403 → "Tu rol no permite esta acción"
- [x] 4.3 Caja: fecha y quien abrió, aviso de caja de días anteriores, efectivo esperado, 409 al abrir muestra la caja abierta, cierre con nota y resumen de diferencias
- [x] 4.4 Cola de pedidos QR por cobrar con cobro (mismo flujo de pago), y corregir/anular para Encargado o superior
- [x] 4.5 Cocina: pedidos con `kitchen=true`, botón anular solo para Encargado o superior con motivo

## 5. Admin

- [x] 5.1 Coordinar con la rama local `fix/user-role-update` (Sources) antes de tocar auth y usuarios
- [x] 5.2 Bloquear ingreso de `cashier` y `cook` con mensaje "Usá el POS"
- [x] 5.3 Alta y edición de usuarios: roles ofrecidos según quien crea, etiqueta "Encargado" y "Cocinero"

## 6. Verificación

- [x] 6.1 `docker exec smartcomanda_api npm test` en verde
- [x] 6.2 Probar en el POS: cerrar la caja abierta desde septiembre y abrir una nueva
- [x] 6.3 Probar en el POS el flujo QR con usuarios Cajero y Cocinero reales (pedido #9: Cajero cobró, Cocinero despachó)
- [x] 6.4 Probar en el POS anular un pedido cobrado con Encargado y revisar los totales de caja

## 7. Quién cobró

- [x] 7.1 Migración `015_add_paid_by_to_orders.js`, `paidBy`/`paidByName` en la API y "Cobró …" en el listado de pedidos del admin
