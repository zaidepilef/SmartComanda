## Why

La API de SmartComanda no cuenta con documentación accesible para los desarrolladores ni para los consumidores externos. Sin una especificación OpenAPI, integrar clientes (frontend-admin, n8n, integraciones futuras) es lento y propenso a errores. Ahora que la API ya tiene varios módulos consolidados (auth, users, tenants, branches), es el momento de exponer su contrato de forma estándar.

## What Changes

- Agregar dependencias `swagger-jsdoc` y `swagger-ui-express` al backend.
- Crear un módulo de configuración Swagger/OpenAPI (`backend/src/config/swagger.js`).
- Exponer una ruta `GET /api/docs` (Swagger UI) y `GET /api/docs.json` (spec JSON) en el servidor.
- Documentar los endpoints existentes mediante anotaciones JSDoc en los controladores (auth, users, tenants, branches, health).
- Definir schemas OpenAPI para los modelos principales (User, Tenant, Branch, respuestas de error y login).
- Servir la documentación solo en entornos de desarrollo y producción controlada (nunca exponer secretos en la spec).

## Capabilities

### New Capabilities
- `api-documentation`: Especificación OpenAPI de la API pública con Swagger UI embebido, incluyendo schemas, endpoints, seguridad por Bearer token y respuestas de error estándar.

### Modified Capabilities
<!-- Ninguna: los cambios son aditivos y no alteran el comportamiento de endpoints existentes. -->

## Impact

- **Backend**: `backend/package.json` (nuevas dependencias), `backend/src/server.js` (montaje de rutas de documentación), `backend/src/config/` (nuevo `swagger.js`), controladores en `backend/src/controllers/` (anotaciones JSDoc).
- **API**: Se agregan rutas nuevas (`/api/docs`, `/api/docs.json`); no se modifican endpoints existentes.
- **Seguridad**: La spec no debe incluir valores sensibles; el acceso a Swagger UI debería restringirse a entornos no productivos por defecto.
- **Sin impacto en base de datos** ni en el frontend.