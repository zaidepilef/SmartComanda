## 1. Backend (@backend)

- [x] 1.1 `deliverOrderSchema`: `paymentMethod` opcional (efectivo sigue exigiendo `cashReceived`)
- [x] 1.2 `deliverOrder`: si el pedido está `paid`, solo pasarlo a `delivered` (sin caja ni cobro); si no está pagado y falta `paymentMethod`, 400
- [x] 1.3 Swagger de `/api/orders/{id}/deliver`
- [x] 1.4 Tests: entregar un pedido ya pagado sin caja abierta; `voided` sigue en 409; sin método en pedido pendiente es 400

## 2. POS (@frontend-pos)

- [x] 2.1 `OrdersService.deliver` con método opcional
- [x] 2.2 Reparto: botón "Entregar (ya pagado)" para pedidos `paid`, sin modal de cobro

## 3. Verificación

- [x] 3.1 Tests del backend y build del POS
- [x] 3.2 Probar en local un domicilio pagado que sale a reparto y se entrega
