## Context

El pedido por QR hoy captura solo `phone` en el cliente (`@frontend-client`), el endpoint público `POST /api/public/orders` valida solo `phone` y guarda `clientPhone` (persistido por `toOrderDocument`), y el modelo `customer` solo conserva `phone` y `pointsBalance`. El backend ya soporta `clientContact` opcional para órdenes autenticadas y el KDS (`@frontend-pos`) ya renderiza `clientContact` y el tipo de orden en las tarjetas, pero las órdenes QR no envían ese dato, por lo que la cocina no ve quién pidió. Ver `proposal.md` — Why.

## Goals / Non-Goals

**Goals:**
- Capturar nombre + teléfono en el flujo QR y persistirlos en la orden (`clientName`, `clientPhone`) y en el registro del cliente.
- Mostrar quién pidió (nombre + teléfono) y cómo (tipo de pedido) en el KDS.
- Mantener compatibilidad del listado/detalle de órdenes (exponer `clientName` donde hoy se expone `clientContact`/`clientPhone`).

**Non-Goals:**
- Verificación formal del número (WhatsApp) o del nombre.
- Cambios en el flujo de pago/checkout.
- Autenticación/registro de clientes con cuenta.

## Decisions

### 1. Campo de identidad: `clientName` en la orden
Se agrega `clientName` como campo propio en el documento de orden (al lado de `clientPhone` y `clientContact`). `clientContact` queda como vía libre usada por órdenes autenticadas (POS). Para órdenes QR, `createPublicOrder` guardará `clientName` + `clientPhone`.
- **Alternativa descartada**: reutilizar `clientContact` para el nombre QR — mezcla dos semánticas distintas y complica el KDS.

### 2. Validación `name` como obligatoria en el endpoint público
`publicSchemas.js` transpone `phone` a `clientPhone`; se agrega `name` (trim, min 1) requerido en `POST /api/public/orders`. Es **breaking** respecto al contrato actual, alineado con la propuesta.
- **Alternativa descartada**: `name` opcional — contradice "el cliente siempre se identifica" y deja al KDS sin dato.

### 3. Customer con nombre persistido
El `upsertCustomer` del `publicService` pasa a recibir `name`; en `customerService` se hace upsert con set de `name` (sin borrar saldo de puntos). Modelo `customer` y `getBalance` siguen intactos.
- **Alternativa descartada**: no guardar el nombre del cliente, solo en la orden — pierde el contexto del cliente para future campañas.

### 4. Persistencia local del cliente (nombre + teléfono) por tenant
En `@frontend-client`, `OrderStore` pasa de guardar solo `phone` a guardar `name` + `phone` bajo la misma clave `sc_phone_{tenantId}` (objeto) o clave adicional `sc_name_{tenantId}`. Se usa la misma semántica "remembered per branch" del spec.
- **Alternativa descartada**: almacenar la identidad global (sin tenant) — rompe la regla de recuerdo por tenant.

### 5. KDS muestra nombre + teléfono + tipo de pedido
`@frontend-pos`: la interfaz `Order` expone `clientName?`; en `kds.html` la meta de cada tarjeta muestra `orderTypeLabel`, nombre y teléfono (`clientName · clientPhone`). El POS/checkout muestra ambos campos para órdenes `qr`.

## Risks / Trade-offs

- [Breaking del endpoint público (agrega `name` requerido)] → Cambio coordinado en un solo release: se actualiza `@frontend-client` y `@backend` juntos; el KDS tolera órdenes sin nombre 🡒 el meta no muestra la línea extra.
- [Órdenes históricas sin `clientName`] → El KDS y el detalle renderizan como campo opcional (no rompen).
- [GPU/UX: más campos en el formulario] → El nombre es un solo input adicional; se valida con regex simple y se rellena desde localStorage como el teléfono.

## Migration Plan

1. Desplegar `@backend` (validación + `createOrder` + `customer`) junto con el `@frontend-client` actualizado en el mismo release (rama `develop` de cada repo, integradas por el monorepo).
2. `@frontend-pos` (KDS) es forward-compatible: puede desplegarse antes o después sin dependencia del payload nuevo.
3. Rollback: revertir el frontend-client y mantener `name` como opcional en backend durante la transición no es necesario si el despliegue es conjunto; si se desfasa, el backend rechaza pedidos sin `name` (falla visible e inmediata de la app cliente).