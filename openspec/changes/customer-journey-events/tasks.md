## 1. Backend: almacenamiento e ingesta (@backend)

- [x] 1.1 Migración PG: tabla `customer_journey_events` con índices por sucursal/fecha y por sesión
- [x] 1.2 Repositorio de eventos (insertar lote, consultar sesiones, línea de tiempo, embudo)
- [x] 1.3 Esquema zod de lote de eventos (tipos permitidos, máx. 50 eventos, `data` máx. 2 KB)
- [x] 1.4 `POST /api/public/events` con `publicRateLimit`, validación de sucursal activa y resolución de `customer_id` en `identity_submitted`
- [x] 1.5 Leer `X-Journey-Session` en `POST /api/public/orders` y registrar `order_created` / `order_failed` (incluye rechazos de validación) con `source = server`
- [x] 1.6 Job diario de retención (90 días)
- [x] 1.7 Tests de ingesta, rechazo de lotes inválidos y eventos de servidor

## 2. Backend: consultas para el admin (@backend)

- [x] 2.1 `GET /api/branches/:branchId/journey/sessions` con filtro de fechas y etapa derivada
- [x] 2.2 `GET /api/branches/:branchId/journey/sessions/:sessionId` (línea de tiempo)
- [x] 2.3 `GET /api/branches/:branchId/journey/funnel`
- [x] 2.4 Guards de rol (`admin`, `owner`) y aislamiento por tenant; tests de acceso cruzado
- [x] 2.5 Documentar endpoints en la documentación de la API

## 3. Client: emisión de eventos (@frontend-client)

- [ ] 3.1 Servicio `JourneyService`: id de sesión en `sessionStorage`, cola, envío en lote y `sendBeacon` al ocultar la página
- [ ] 3.2 Emitir eventos desde el flujo (QR abierto, menú, identidad, carrito, envío, resultado) y nueva sesión tras "Hacer otro pedido"
- [ ] 3.3 Enviar `X-Journey-Session` en `createOrder`
- [ ] 3.4 Garantizar que fallos de tracking no afecten el pedido (tests)

## 4. Admin: visualizador (@frontend-admin)

- [ ] 4.1 Servicio API de journey y modelos tipados
- [ ] 4.2 Vista "Eventos de clientes": selector de sucursal y fechas, lista de sesiones con etapa y refresco periódico
- [ ] 4.3 Panel de línea de tiempo de la sesión
- [ ] 4.4 Embudo de conversión
- [ ] 4.5 Ruta lazy, guard de rol y entrada en el menú

## 5. Validación

- [ ] 5.1 Prueba end-to-end local: pedido exitoso, pedido fallido y abandono visibles en el admin
- [ ] 5.2 `openspec validate customer-journey-events --strict`
