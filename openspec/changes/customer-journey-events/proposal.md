## Why

Hoy no hay visibilidad de lo que hace un cliente en `@frontend-client` después de escanear el QR: no se sabe si llenó el formulario de identidad, si eligió platos, si intentó enviar el pedido ni por qué falló. Un error como "No se pudo enviar el pedido" (causado por un bug de identidad vacía, ya corregido en `develop`) solo se pudo diagnosticar reproduciéndolo a mano. El local necesita trazabilidad del recorrido del cliente para detectar fallos y abandonos sin depender de que alguien los reporte.

## What Changes

- `@frontend-client` registra los **eventos del recorrido** del cliente en cada visita: QR abierto, menú cargado o fallido, identidad enviada, plato agregado o quitado, carrito abierto, pedido enviado, pedido creado y pedido fallido (con el motivo).
- Cada visita se agrupa en una **sesión anónima** que se vincula al teléfono del cliente cuando se identifica y al pedido cuando se crea.
- `@backend` expone un endpoint público para recibir eventos (en lote, validado y con límite de tasa) y registra además, desde el servidor, el resultado real de cada intento de pedido público (creado o rechazado y motivo).
- `@frontend-admin` agrega un **visualizador de eventos** por sucursal: lista de sesiones con su etapa actual (abrió, identificado, con carrito, envió, falló, abandonó), línea de tiempo de cada sesión y un embudo de conversión por rango de fechas.
- Los eventos se guardan en PostgreSQL con retención limitada.

## Capabilities

### New Capabilities

- `customer-journey-tracking`: captura y almacenamiento de los eventos del recorrido del cliente en el flujo QR (sesión, tipos de evento, ingesta pública, eventos de servidor, privacidad y retención).
- `customer-journey-viewer`: pantalla del admin para consultar sesiones, su etapa y su línea de tiempo, y el embudo de conversión por sucursal.

### Modified Capabilities

Ninguna: el flujo de pedido (`customer-order-flow`) mantiene su comportamiento; solo emite eventos adicionales descritos en `customer-journey-tracking`.

## Impact

- **@frontend-client** (`SmartComanda_client`): servicio de eventos con id de sesión, envío en lote (`sendBeacon` al cerrar), emisión desde el flujo de pedido.
- **@backend** (`SmartComanda_api`): tabla `customer_journey_events` (migración PG), `POST /api/public/events`, registro de eventos de servidor en `createPublicOrder`, endpoints autenticados de consulta (sesiones, línea de tiempo, embudo) con aislamiento por tenant, tarea de limpieza por retención.
- **@frontend-admin** (`SmartComanda_admin`): nueva vista "Eventos de clientes" con filtros por sucursal y fecha, actualización periódica.
- **Specs OpenSpec** (monorepo): dos capacidades nuevas.
