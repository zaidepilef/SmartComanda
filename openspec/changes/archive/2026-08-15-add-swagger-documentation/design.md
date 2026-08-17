## Context

Backend Node.js/Express (ver `backend/src/server.js`) con capas separadas: controllers, services, repositories, validation (schemas). Los endpoints actuales son: `GET /health`, `/api/auth` (login, register, me, logout), `/api/users`, `/api/tenants`, `/api/branches`. No existe ninguna implementación previa de Swagger/OpenAPI en el código. Motivación completa en proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Exponer especificación OpenAPI 3.0 generada desde el código.
- Swagger UI accesible en una ruta dedicada.
- Documentar todos los endpoints existentes sin modificar su comportamiento.
- Restringir el acceso en producción.

**Non-Goals:**
- Generar clientes desde la spec.
- Documentar APIs internas no públicas.
- Agregar autenticación propia a la UI de documentación (solo habilitar/deshabilitar por entorno).

## Decisions

### D1: swagger-jsdoc + swagger-ui-express

Generar la spec desde anotaciones JSDoc en los controladores usando `swagger-jsdoc`, y servir la UI con `swagger-ui-express`.

- **Por qué**: mantiene la documentación cerca del código (cada controller documenta sus endpoints), evita duplicar schemas manualmente cuando ya existen validaciones, y es el estándar de facto en el ecosistema Express.
- **Alternativa considerada**: archivo YAML/JSON estático escrito a mano. Se descartó porque duplica información, se desincroniza fácilmente del código y no escala con la separación por capas existente.

### D2: Anotaciones en controladores, no en rutas

Los comentarios JSDoc de OpenAPI se colocan en las funciones de los controllers (donde vive la lógica de negocio y los contratos de entrada/salida), no en los archivos de rutas.

- **Por qué**: los controllers son el punto donde confluyen validación y respuesta; documentar allí mantiene un único lugar de verdad por endpoint.
- **Alternativa considerada**: anotar en `routes/*.js`. Se descartó por duplicar el mapeo de rutas con la spec y ensuciar la definición de rutas.

### D3: Rutas de documentación montadas en server.js

Se agregan `GET /api/docs` (UI) y `GET /api/docs.json` (spec) montadas desde `server.js`, con un flag de entorno `ENABLE_API_DOCS` (por defecto activo solo fuera de producción).

- **Por qué**: centraliza la decisión de exponer documentación en el arranque, sin tocar cada router existente.
- **Alternativa considerada**: montar la UI en el router de health. Se descartó por acoplar responsabilidades no relacionadas.

### D4: Schemas OpenAPI definidos en config/swagger.js

Los schemas compartidos (User, Tenant, Branch, Error, LoginRequest, LoginResponse, respuestas estándar) se definen en un objeto de configuración Swagger central.

- **Por qué**: los schemas se referencian desde múltiples controllers (`$ref`); centralizarlos evita duplicación.
- **Alternativa considerada**: generar schemas automáticamente desde los esquemas de validación (Zod). Se descartó por ahora por complejidad de mapeo y porque los schemas de validación no cubren las respuestas.

## Risks / Trade-offs

- [Spec desincronizada del código en el futuro] → Mitigación: anotaciones junto a los controllers hacen visible la documentación en cada revisión; validar la spec generada en CI si se desea.
- [Exponer información sensible en producción] → Mitigación: deshabilitar documentación fuera de entornos no productivos vía flag de entorno; nunca incluir secretos en la spec.
- [Ruido en controllers con muchas anotaciones] → Mitigación: mantener anotaciones concisas (resumen, parámetros, respuestas esenciales, tags) y centralizar schemas en swagger.js.