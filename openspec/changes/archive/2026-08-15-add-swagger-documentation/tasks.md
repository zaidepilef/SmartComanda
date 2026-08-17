## 1. Setup de dependencias

- [x] 1.1 Instalar `swagger-jsdoc` y `swagger-ui-express` en backend/package.json
- [x] 1.2 Verificar que `express` y las dependencias existentes sigan funcionando (npm install + arranque)

## 2. Configuración Swagger

- [x] 2.1 Crear `backend/src/config/swagger.js` con la definición OpenAPI base (info, servers, tags, security scheme Bearer)
- [x] 2.2 Definir schemas OpenAPI compartidos en `swagger.js`: User, Tenant, Branch, Error, LoginRequest, LoginResponse y respuestas estándar
- [x] 2.3 Agregar variable de entorno `ENABLE_API_DOCS` en `backend/src/config/env.js` (activa por defecto fuera de producción)

## 3. Anotaciones en controladores

- [x] 3.1 Documentar `authController.js` (login, register, me, logout) con anotaciones JSDoc OpenAPI
- [x] 3.2 Documentar `userController.js` con anotaciones JSDoc OpenAPI
- [x] 3.3 Documentar `tenantController.js` con anotaciones JSDoc OpenAPI
- [x] 3.4 Documentar `branchController.js` con anotaciones JSDoc OpenAPI
- [x] 3.5 Documentar el endpoint de health (route o controller correspondiente)

## 4. Montaje de rutas de documentación

- [x] 4.1 En `backend/src/server.js`, generar la spec con `swagger-jsdoc` apuntando a los archivos anotados
- [x] 4.2 Montar `GET /api/docs` (Swagger UI) y `GET /api/docs.json` (spec) condicionados a `ENABLE_API_DOCS`
- [x] 4.3 Asegurar que en producción las rutas de documentación no estén disponibles

## 5. Validación

- [x] 5.1 Arrancar el backend y verificar que `/api/docs.json` devuelve la especificación completa (todos los endpoints y schemas)
- [x] 5.2 Verificar que `/api/docs` renderiza Swagger UI y que los endpoints con `authRequired` muestran el requisito Bearer
- [x] 5.3 Verificar que con `ENABLE_API_DOCS=false` (o en producción) las rutas devuelven 404
- [x] 5.4 Ejecutar `openspec validate` sobre el cambio