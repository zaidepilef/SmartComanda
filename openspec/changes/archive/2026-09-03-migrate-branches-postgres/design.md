## Context

Ver proposal.md - Why. El módulo Branch persiste hoy en Mongo (`branches`). La identidad ya migró a Postgres (`migrate-identity-postgres`): los usuarios guardan `branchId` como `VARCHAR(24)` en `users`, y `tenantRepository` calcula `branchCount` leyendo la colección Mongo `branches`. Los módulos de órdenes y POS (que siguen en Mongo) consumen `branchRepository.nextOrderNumber(branchId)` como contador atómico. El objetivo es mover la persistencia de Branch a Postgres sin romper esos consumidores ni el payload público.

## Goals / Non-Goals

**Goals:**
- Persistir Branch en la tabla Postgres `branches` con id `VARCHAR(24)` (hex del ObjectId de Mongo) para mantener compatibilidad con `order.tenantId`/`order.branchId`.
- Reescribir `branchRepository` contra Postgres manteniendo las mismas firmas/shapes exportados y `PAYMENT_METHODS`.
- Preservar `nextOrderNumber` como operación **atómica** (equivalente a `$inc`).
- Actualizar `branchService` a multi-rol y `tenantRepository` para que `branchCount` lea de Postgres.
- Migración SQL versionada + import one-time idempotente desde Mongo.
- Re-apuntar los consumidores de `branchRepository` al repo Postgres.

**Non-Goals:**
- Migrar los módulos de órdenes, caja, platos, ingredientes, inventario o loyalty (siguen en Mongo; se abordan en cambios futuros).
- Cambiar el contrato de la API de branches (endpoints, payload, autorización por roles manager/cashier).
- Cambiar `paymentMethods` de estructura.

## Decisions

### D1: Id de branch como `VARCHAR(24)` (hex del ObjectId) en lugar de UUID formateado
Los módulos Mongo restantes (órdenes, caja) convierten los ids de string con `new ObjectId(...)`, que exige 24 hex. Mantener `VARCHAR(24)` con el hex original preserva la coexistencia híbrida del mismo modo que la identidad (D1 del cambio anterior). Alternativa (UUID canónico) descartada por incompatibilidad con los consumidores Mongo.

### D2: Contador atómico vía `UPDATE branches SET next_order_number = next_order_number + 1 RETURNING next_order_number`
Replica el comportamiento de `findOneAndUpdate({ $inc })` de Mongo de forma transaccional y atómica, sin riesgo de duplicados bajo concurrencia. Coatificada en una sola sentencia SQL.

### D3: Tabla `branches` como única fuente, con `tenantRepository.branchCount` re-puntado a Postgres
Se elimina la lectura de la colección Mongo `branches` desde `tenantRepository.countBranches`. El `branchCount` pasa a un `COUNT(*)` sobre la tabla `branches` (`GROUP BY tenant_id`). La colección Mongo `branches` queda deprecada (sin lecturas nuevas del módulo Branch).

### D4: Migración SQL versionada 002 + import idempotente
Se añade `src/migrations-pg/002_create_branches.js` (esquema + índices) y se extiende el import de identidad o se crea un import de branches (`ON CONFLICT (id) DO UPDATE`) para copiar desde Mongo preservando ids. El arranque sigue aplicando migraciones en orden antes de escuchar.

### D5: Multi-rol explícito en `branchService`
`listBranches` usaba `actor?.role === "cashier"` (singular). Se cambia a evaluar el set de roles (`actorRoles`), alineado con la capa `tenantScope`. El `effectiveActive` (cashier ve solo activas) se decide por pertenencia al set.

### D6: Mantener shape `_id` en respuestas
El repo Postgres devuelve objetos con `_id` (hex) para que los controllers y consumidores (`orderService` que usa `branch._id`) no cambien.

## Risks / Trade-offs

- **Coexistencia con módulos Mongo restantes** → Reducción: ids `VARCHAR(24)` preservan compatibilidad; `nextOrderNumber` se mantiene atómico para órdenes/POS. Riesgo restante: escribir una branch nueva crea la fila en Postgres, pero si un flujo Mongo antiguo la leyera desde la colección Mongo no la vería. Mitigación: re-puntar TODOS los consumidores de `branchRepository` en el mismo cambio.
- **Import con datos existentes** → Mitigación: idempotente (`ON CONFLICT`); ejecutar en cada despliegue sin duplicar.
- **Volumen Postgres con esquema previo** → Mitigación: la migración 002 usa `CREATE TABLE IF NOT EXISTS`; si ya existiera una tabla `branches` parcial, la recreación limpia requiere borrar volumen (igual que en identidad).

## Migration Plan

1. Añadir migración 002 (`branches`) y arrancar la API en un volumen limpio para verificar el esquema.
2. Ejecutar el import de branches desde Mongo (`npm run db:import-branches`) y verificar conteos.
3. Re-puntar `branchRepository`/`tenantRepository` y consumidores.
4. Validar end-to-end vía API: crear/editar/listar/obtener branch, `nextOrderNumber` con ordenes, `branchCount`.

## Open Questions

_(ninguna — las decisiones D1–D6 resuelven los puntos inciertos antes de implementar)_
