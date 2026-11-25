## 1. Backend

- [x] 1.1 Migración `016_add_geo_to_branches.js`: `lat`, `lng`, `delivery_max_km`, `delivery_max_minutes`, `delivery_avg_speed_kmh` (default 25)
- [x] 1.2 Migración `017_add_delivery_to_orders.js`: dirección, referencia, coordenadas, precisión, distancia, minutos, fuera de rango e índice para el reporte
- [x] 1.3 `utils/geo.js` con `haversineKm` y `estimateDelivery`, más tests
- [x] 1.4 Sucursales: validación, repositorio y Swagger con coordenadas y límites
- [x] 1.5 Pedido público con `orderType` `delivery` y datos de entrega; el servidor calcula la estimación
- [x] 1.6 `POST /api/public/delivery-estimate` sin exponer coordenadas de la sucursal
- [x] 1.7 `GET /api/orders/delivery-analytics` con lista y agregados

## 2. Admin

- [x] 2.1 Selector de ubicación con mapa y lector de links de Google Maps
- [x] 2.2 Sección "Ubicación y delivery" en el detalle de sucursal (pestaña Configuración)
- [x] 2.3 Datos de entrega y "Ver en mapa" en el detalle de pedidos
- [x] 2.4 Vista "Análisis delivery"

## 3. Cliente

- [x] 3.1 Selector Retiro en local / Domicilio
- [x] 3.2 Servicio de geolocalización y componente de ubicación con mapa
- [x] 3.3 Vista previa de la estimación y envío del pedido a domicilio
- [x] 3.4 Header `Permissions-Policy: geolocation=(self)`

## 4. POS

- [x] 4.1 Datos de entrega en cocina, pedidos QR y recibo

## 5. Verificación

- [x] 5.1 Tests del backend en verde
- [x] 5.2 Builds de admin, cliente y POS
- [x] 5.3 Pedido a domicilio desde el celular emulado contra la API local (GPS simulado y permiso denegado)
- [x] 5.4 Probar admin (ubicar sucursal, pedidos, reporte) y POS (cola y cocina) con sesión iniciada
