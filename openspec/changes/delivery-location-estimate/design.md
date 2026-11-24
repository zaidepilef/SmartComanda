## Context

- `branches` (`migrations-pg/002_create_branches.js`) solo tiene `address` y `city` en texto; no hay coordenadas en ningún módulo.
- `publicService.createPublicOrder` fija `orderType: "qr"`; la app del cliente no tiene modo domicilio.
- `getPublicMenu` devuelve solo `businessName` y `branchName`.
- Los navegadores solo entregan la ubicación en contextos seguros (HTTPS o `localhost`) y con permiso del usuario.

## Goals / Non-Goals

**Goals:**
- Guardar coordenadas exactas de la sucursal y del cliente.
- Estimar distancia y minutos, marcar fuera de rango por sucursal y mostrarlo al cliente, en POS, en admin y en un reporte.

**Non-Goals:**
- Precio de envío, zonas tarifarias o bloqueo de pedidos fuera de rango.
- Ruteo por calles reales, tráfico o seguimiento del repartidor.
- Pedidos a domicilio desde el POS o admin (siguen usando `clientContact`).

## Decisions

1. **Estimación en línea recta.** `utils/geo.js` calcula Haversine × `ROAD_FACTOR = 1.4` ÷ `delivery_avg_speed_kmh` (25 por defecto) y redondea hacia arriba los minutos. Es la única fuente de verdad: el endpoint de estimación y la creación del pedido la usan. *Alternativas descartadas*: OSRM (servidor demo no apto para producción) y Google Distance Matrix (API key y costo). Cambiar el método después solo toca `estimateDelivery`.
2. **Fuera de rango es un aviso.** `outOfRange` es verdadero si supera `delivery_max_km` o `delivery_max_minutes` (cuando están definidos). Sin coordenadas en la sucursal, la estimación es `null` y el pedido se crea igual.
3. **El servidor recalcula.** El pedido guarda `delivery_distance_km`, `delivery_eta_minutes` y `delivery_out_of_range` calculados al crearlo, con la configuración de ese momento, para que el reporte refleje lo que se estimó.
4. **Coordenadas de la sucursal no son públicas.** `POST /api/public/delivery-estimate` devuelve solo distancia, minutos y fuera de rango. El cliente centra su mapa en su propia ubicación o en un centro por defecto.
5. **Links de Google Maps se leen en el navegador.** El admin acepta `@lat,lng`, `?q=lat,lng`, `!3dLAT!4dLNG` y `lat, lng`. Los links cortos (`maps.app.goo.gl`) no se resuelven: el servidor no sigue URLs externas (riesgo SSRF) y se pide la URL completa.
6. **Mapas con Leaflet + OpenStreetMap.** Sin API key. Geocodificación inversa con Nominatim solo cuando el usuario fija el punto, nunca en bucle.
7. **Datos personales.** Las coordenadas del cliente solo se devuelven en endpoints autenticados del staff de su tenant.

## Risks / Trade-offs

- Línea recta subestima rutas con ríos, autopistas o cerros → el factor 1,4 compensa en promedio; el reporte sirve para calibrarlo.
- Nominatim limita a ~1 req/s → solo se llama por acción del usuario; si crece el uso, se cambia de proveedor.
- Precisión del GPS baja en PC o en interiores → se muestra la precisión y el marcador se puede arrastrar.
