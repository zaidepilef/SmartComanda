## Context

El flujo QR (`@frontend-client`) es una SPA sin autenticación que llama a `/api/public/*` (`@backend`, Express + PostgreSQL, validación con zod, `publicRateLimit` en memoria por IP y ruta). El admin (`@frontend-admin`) ya tiene vistas por sucursal (`qr-codes`, `branch-detail`, `orders`) protegidas por rol y tenant. No existe hoy ningún registro de actividad del cliente. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Reconstruir el recorrido completo de una visita y su motivo de fallo.
- Que la trazabilidad nunca rompa ni enlentezca el pedido.
- Datos personales mínimos y aislados por tenant.

**Non-Goals:**
- Analítica de producto general (heatmaps, grabación de sesiones, A/B).
- Tiempo real con WebSockets/SSE: se usa refresco periódico.
- Seguimiento del pedido después de crearse (cocina, pago): ya cubierto por `order-listing` y `kitchen-display`.

## Decisions

1. **Tabla propia en PostgreSQL** `customer_journey_events` (`id`, `tenant_id`, `branch_id`, `session_id` uuid, `type`, `customer_id` nullable, `order_id` nullable, `data` jsonb, `occurred_at`, `received_at`, `source` `client|server`), con índices `(tenant_id, branch_id, occurred_at desc)` y `(session_id, occurred_at)`.
   *Alternativas:* servicio externo de analítica (saca datos del cliente fuera de la plataforma y añade dependencia) o MongoDB (el proyecto está migrando a solo PostgreSQL).
2. **Sesión generada en el cliente** (`crypto.randomUUID()` en `sessionStorage`), enviada en el header `X-Journey-Session` también en `POST /api/public/orders`, para que el servidor vincule su propio evento a la sesión.
3. **Envío en lote**: el cliente acumula eventos y los envía cada pocos segundos o al cambiar de etapa, y con `navigator.sendBeacon` al ocultarse la página. Fallos de envío se descartan en silencio (máx. un reintento) para no afectar el pedido.
4. **Eventos de servidor para el resultado del pedido**: un middleware (`trackOrderOutcome`) colocado antes de la validación de `POST /api/public/orders` registra `order_created` / `order_failed` con `source = server` al terminar la respuesta, incluidos los rechazos 400. Es la única fuente de `order_created`; el cliente solo envía `order_failed` cuando no obtiene respuesta HTTP (error de red, `status: 0`), así no se duplican eventos.
   *Alternativa:* registrar dentro de `createPublicOrder` (no ve los rechazos de validación, que ocurren antes).
5. **Identidad por referencia**: al recibir `identity_submitted` el backend resuelve o crea el `customer` por teléfono y guarda solo `customer_id`; el nombre y teléfono se muestran en el admin vía join con `customers`.
6. **Etapa derivada al consultar** (no almacenada): el endpoint de sesiones agrega por `session_id` y calcula la etapa con las reglas del spec. Evita inconsistencias y no requiere actualizar filas.
7. **Endpoints de consulta autenticados** bajo `/api/branches/:branchId/journey/` (`sessions`, `sessions/:sessionId`, `funnel`), con los mismos guards de rol y tenant que las vistas de sucursal.
8. **Retención** con un job diario en el backend (`DELETE ... WHERE occurred_at < now() - interval '90 days'`).

## Risks / Trade-offs

- [Endpoint público abusable para llenar la tabla] → validación estricta de tipos, tamaño de lote (máx. 50) y de `data` (máx. 2 KB), sucursal activa obligatoria y `publicRateLimit`.
- [Rate limit en memoria no se comparte entre réplicas] → aceptable con una réplica; se revisará si se escala.
- [Clientes del mismo local comparten IP (Wi-Fi)] → la ingesta usa su propio límite (1200 peticiones / 15 min por IP), separado del de pedidos y menú.
- [sendBeacon entre dominios no admite `application/json` sin preflight] → el endpoint acepta también `text/plain` y lo interpreta como JSON.
- [Eventos del cliente pueden perderse (cierre abrupto, bloqueadores)] → el resultado del pedido siempre lo registra el servidor.
- [Crecimiento de la tabla] → índices por sucursal/fecha y retención de 90 días.

## Migration Plan

1. Migración PG que crea la tabla e índices (aditiva, sin tocar datos existentes).
2. Desplegar `@backend` (ingesta, eventos de servidor, consultas, job). Sin cambios en clientes, no hay eventos y nada se rompe.
3. Desplegar `@frontend-client` con la emisión de eventos.
4. Desplegar `@frontend-admin` con la vista.
Rollback: revertir cada frontend de forma independiente; la tabla puede quedar sin uso.

## Open Questions

- Umbral de inactividad para `abandonó` (se propone 30 min) y período de refresco del admin (se propone 10 s): ajustables sin cambiar el diseño.
