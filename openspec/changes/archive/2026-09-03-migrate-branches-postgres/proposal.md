## Why

El dominio de identidad ya migró a PostgreSQL (`migrate-identity-postgres`), pero el módulo Branch sigue persistiendo en MongoDB. Branch es el siguiente candidato natural porque ya está entrelazado con la identidad Postgres (los usuarios guardan `branchId` y los tenants calculan su `branchCount` leyendo branches de Mongo). Migrarlo a Postgres elimina la dependencia cross-DB y deja el primer módulo de negocio sobre el nuevo backend unificado.

## What Changes

- Nueva tabla `branches` en PostgreSQL con id `VARCHAR(24)` (hex del ObjectId de Mongo) para preservar compatibilidad con `order.tenantId`/`order.branchId` que siguen en Mongo.
- Reescribir `branchRepository.js` contra Postgres conservando las mismas firmas y shapes exportados (incluyendo `_id` y `nextOrderNumber`), y declara `PAYMENT_METHODS`.
- Mantener `nextOrderNumber(branchId)` como operación atómica (equivalente a `$inc` vía `UPDATE ... RETURNING`), ya que los módulos de órdenes y POS que aún viven en Mongo lo consumen.
- Actualizar `branchService.js` para evaluar el set de roles (multi-rol) y re-puntar al repo Postgres.
- Añadir migración SQL versionada para el esquema de branches.
- Añadir import one-time idempotente de branches desde Mongo (preservando ids) y actualizar `tenantRepository` para que el `branchCount` lea de Postgres.
- Re-apuntar los consumidores downstream de `branchRepository` (userService, orderService, publicService, dishService, cashSessionService, inventoryService, loyaltyService) al repo Postgres.

## Capabilities

### New Capabilities
- `branches-postgres-storage`: Establece PostgreSQL como capa de persistencia del módulo Branch (tabla, migraciones versionadas, import idempotente desde Mongo y contador atómico de números de orden).

### Modified Capabilities
_(ninguno — el comportamiento público de `branch-management` no cambia; solo cambia la implementación de almacenamiento)_

## Impact

- **Backend**: `branchRepository.js` (reescrito a Postgres), `branchService.js` (multi-rol + Postgres), `tenantRepository.js` (branchCount desde Postgres), `userService.js`, `orderService.js`, `publicService.js`, `dishService.js`, `cashSessionService.js`, `inventoryService.js`, `loyaltyService.js` (consumidores re-puntados).
- **DB**: nueva tabla `branches` en la base `smartcomanda` (migración SQL 002), contador `next_order_number`.
- **API**: sin cambios de endpoints ni payload público (los campos `_id`, `tenantId`, `name`, `type`, `address`, `city`, `phone`, `active`, `paymentMethods` se mantienen).
- **Dependencias**: `pg` ya disponible; Mongo `branches` queda marcada como deprecada (sin lecturas nuevas del módulo Branch una vez migrado el branchCount).
