## Why

Para ofrecer pedidos a domicilio primero hay que saber dónde está cada sucursal, dónde está el cliente y cuánto tardaría en llegar un pedido. Hoy no se guardan coordenadas en ningún módulo: la sucursal solo tiene una dirección en texto y la app del cliente solo crea pedidos `qr`. Este cambio es para **analizar** la cobertura; los precios de envío quedan fuera.

## What Changes

- **Ubicación de la sucursal**: en admin, cada sucursal guarda latitud y longitud exactas, ingresadas como coordenadas, pegando un link de Google Maps o marcando el punto en un mapa (Leaflet + OpenStreetMap). También guarda sus límites de delivery: km máximos, minutos máximos y velocidad promedio del repartidor (25 km/h por defecto).
- **Modo domicilio en la app del cliente**: después de nombre y teléfono, el cliente elige "Retiro en local" o "Domicilio". En domicilio indica su dirección con el GPS del celular (`navigator.geolocation`, con su permiso) y la confirma o ajusta en un mapa. Si niega el permiso, puede escribir la dirección a mano.
- **Estimación de envío**: distancia en línea recta (Haversine) × 1,4 (factor de calles) ÷ velocidad promedio = minutos estimados. Si supera los límites de la sucursal, el pedido se marca **fuera de rango**. Es solo un aviso: no bloquea el pedido. El servidor calcula la estimación (nunca confía en el cliente) y la guarda en el pedido.
- **Dónde se ve**: el cliente ve "Llegamos en ~X min" antes de confirmar; POS y admin ven la dirección, la distancia, los minutos, el aviso y un link "Ver en mapa" en cada pedido a domicilio; además hay un reporte de análisis de delivery en admin.

## Capabilities

### New Capabilities

- `delivery-analytics`: reporte en admin de pedidos a domicilio con distancia, minutos estimados, fuera de rango, agregados y mapa.

### Modified Capabilities

- `branch-management`: coordenadas de la sucursal y límites de delivery.
- `customer-order-flow`: elegir retiro o domicilio, dirección con ubicación del dispositivo, vista previa de la estimación, pedidos a domicilio y datos de entrega visibles en POS/admin.
- `public-menu`: endpoint público de estimación que no expone las coordenadas de la sucursal.
- `tenant-data-model`: columnas nuevas en `branches` y `orders`.

## Impact

- **@backend** (`SmartComanda_api`): migraciones `016_add_geo_to_branches.js` y `017_add_delivery_to_orders.js`, `utils/geo.js`, validación de sucursal y pedido público, `POST /api/public/delivery-estimate`, `GET /api/orders/delivery-analytics`, Swagger y tests.
- **@frontend-admin** (`SmartComanda_admin`): selector de ubicación con mapa y lector de links de Google Maps en sucursales, datos de entrega en pedidos, vista "Análisis delivery". Dependencia nueva: `leaflet`.
- **@frontend-client** (`SmartComanda_client`): selector Retiro/Domicilio, servicio de geolocalización, mapa y estimación. Dependencia nueva: `leaflet`. Header `Permissions-Policy: geolocation=(self)` en nginx.
- **@frontend-pos** (`SmartComanda_pos`): datos de entrega en cocina, pedidos QR y recibo.
- **Externo**: tiles de OpenStreetMap y geocodificación inversa de Nominatim (uso bajo, solo por acción del usuario).
