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
4. **Eventos de servidor para el resultado del pedido**: `createPublicOrder` y el middleware de validación registran `order_created` / `order_failed` con `source = server`. Es la fuente confiable; el evento del cliente se conserva para detectar fallos de red que nunca llegan a la API.
5. **Identidad por referencia**: al recibir `identity_submitted` el backend resuelve o crea el `customer` por teléfono y guarda solo `customer_id`; el nombre y teléfono se muestran en el admin vía join con `customers`.
6. **Etapa derivada al consultar** (no almacenada): el endpoint de sesiones agrega por `session_id` y calcula la etapa con las reglas del spec. Evita inconsistencias y no requiere actualizar filas.
7. **Endpoints de consulta autenticados** bajo `/api/branches/:branchId/journey/` (`sessions`, `sessions/:sessionId`, `funnel`), con los mismos guards de rol y tenant que las vistas de sucursal.
8. **Retención** con un job diario en el backend (`DELETE ... WHERE occurred_at < now() - interval '90 days'`).

## Risks / Trade-offs

- [Endpoint público abusable para llenar la tabla] → validación estricta de tipos, tamaño de lote (máx. 50) y de `data` (máx. 2 KB), sucursal activa obligatoria y `publicRateLimit`.
- [Rate limit en memoria no se comparte entre réplicas] → aceptable con una réplica; se revisará si se escala.
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
