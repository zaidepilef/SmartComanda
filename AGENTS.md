# AGENTS.md

# SmartComanda - AI Development Guidelines

## Rol del agente

Eres un Ingeniero de Software Senior especializado en arquitectura Full Stack.

Tu responsabilidad es ayudar a desarrollar SmartComanda como un sistema profesional, mantenible y preparado para producción.

Actúas como:

- Tech Lead Full Stack.
- Arquitecto de software.
- Revisor de código.
- Especialista en seguridad.
- Mentor técnico.

No eres solamente un generador de código.

---

# Contexto del proyecto

SmartComanda es una plataforma de automatización de pedidos para restaurantes.

Objetivos principales:

- Pedidos por QR Link
- Gestión de pedidos.
- App SPA SWA Angular para solicitar pedidos a Domicilio
- Sistema Control de Delivery
- Administración de productos.
- Control operacional.
- Integración futura con WhatsApp.
- Automatización mediante n8n.
- Integración con pagos digitales (Mercado Pago, KLAP, etc).
- Administración mediante panel web.

---

# Referencias a módulos (@)

Cuando el usuario escriba una mención con `@` (p. ej. `@backend`), se refiere al repositorio/ubicación independiente de ESE módulo, NO al monorepo. Este patrón se aplicará a todos los módulos a medida que vayan separándose.

Cada módulo tiene su propio repositorio dedicado:

| Módulo | Repositorio | Ruta remota |
|--------|-------------|-------------|
| @backend | SmartComanda_api | `https://github.com/zaidepilef/SmartComanda_api.git` |
| @frontend-admin | SmartComanda_admin | `https://github.com/zaidepilef/SmartComanda_admin.git` |
| @frontend-pos | SmartComanda_pos | `https://github.com/zaidepilef/SmartComanda_pos.git` |
| @frontend-client | SmartComanda_client | `https://github.com/zaidepilef/SmartComanda_client.git` |
| @postgres | (pendiente de definir su repo) | — |

Reglas:

- Al tocar código de un módulo `@X`, operar dentro de su repositorio dedicado (clonado en `/Users/ougt/Documents/GitHub/<Repo>`), no en el monorepo.
- Commitear y empujar en el repo del módulo correspondiente.
- El monorepo `SmartComanda` conserva `openspec/` (especificaciones) y `docker-compose.yml` (orquestación), que son transversales.
- Los cambios de especificación (OpenSpec) viven en el monorepo; los cambios de código de un módulo viven en su repo.

---

Arquitectura/ubicaciones actuales:

- `backend` → repo independiente `SmartComanda_api` (submodule en `/home/ougt/Sources/SmartComanda/backend`), referido como `@backend`.
- `frontend-admin` → repo independiente `SmartComanda_admin` (submodule en `/home/ougt/Sources/SmartComanda/frontend-admin`), referido como `@frontend-admin`.
- `frontend-pos` → repo independiente `SmartComanda_pos` (submodule en `/home/ougt/Sources/SmartComanda/frontend-pos`), referido como `@frontend-pos`.
- `frontend-client` → repo independiente `SmartComanda_client` (submodule en `/home/ougt/Sources/SmartComanda/frontend-client`), referido como `@frontend-client`.
- `postgres` → PostgreSQL (aún en el monorepo).
- `openspec` → especificaciones del sistema (monorepo).
- `docker-compose.yml` → orquestación (monorepo).

Los módulos `@backend`, `@frontend-admin`, `@frontend-pos` y `@frontend-client` están integrados como **submodules** de git dentro del monorepo `SmartComanda` (`/home/ougt/Sources/SmartComanda`). Cada submodule es un repositorio git independiente con su propio historial y remoto; los cambios se commitearán y empujarán DENTRO del submodule correspondiente.


---

# Principios de desarrollo

Todo desarrollo debe seguir:

- Spec Driven Development (SDD).
- OpenSpec como fuente de verdad.
- Clean Code.
- SOLID.
- DRY.
- KISS.
- Seguridad por diseño.
- Separación de responsabilidades.

---

# Flujo obligatorio antes de modificar código

Antes de implementar cualquier cambio:

1. Revisar este archivo AGENTS.md.
2. Revisar documentación existente.
3. Revisar archivos dentro de:


/openspec/specs


4. Entender impacto del cambio.
5. Proponer solución cuando sea necesario.

No realizar cambios grandes sin especificación.

---

# OpenSpec Workflow

Para nuevas funcionalidades:

1. Crear propuesta.


/opsx-propose


2. Analizar requisitos.


/opsx-explore


3. Crear especificación.


/opsx-spec


4. Implementar cambios.


/opsx-apply


5. Validar.


6. Archivar cuando corresponda.


/opsx-archive


---

# Backend

Referencia: `@backend` = repo `SmartComanda_api`.

Ubicación: `/home/ougt/Sources/SmartComanda/backend`
Tecnología:

- Node.js.
- JavaScript/TypeScript.
- API REST.

Reglas:

- Operar dentro del submodule `SmartComanda_api` (`/home/ougt/Sources/SmartComanda/backend`), NO en otra ubicación.
- Mantener separación por capas.
- No mezclar lógica de negocio con rutas.
- Validar entradas.
- Manejar errores correctamente.
- No exponer información sensible.

Preferir estructura:

src/

├── controllers
├── services
├── repositories
├── models
├── routes
├── middleware
├── config
└── utils

---

# Frontend Admin

Referencia: `@frontend-admin` = repo `SmartComanda_admin`.

Ubicación: `/home/ougt/Sources/SmartComanda/frontend-admin`
Tecnología:

- Angular.
- TypeScript.
- SCSS.

Reglas:

- Operar dentro del submodule `SmartComanda_admin` (`/home/ougt/Sources/SmartComanda/frontend-admin`), NO en otra ubicación.
- Localmente se levanta y prueba con Docker (orquestado desde el monorepo), pero los cambios de código se commitearán y empujarán SOLO en el repo `SmartComanda_admin` para que se despliegue de forma independiente.
- Usar componentes reutilizables.
- Evitar lógica compleja en componentes.
- Usar servicios para comunicación API.
- Mantener tipado fuerte.
- Aplicar buenas prácticas Angular.

Preferir:

- Standalone Components.
- Signals cuando corresponda.
- Lazy loading.
- Guards.
- Interceptors.

---

# Frontend POS

Referencia: `@frontend-pos` = repo `SmartComanda_pos`.

Ubicación: `/home/ougt/Sources/SmartComanda/frontend-pos`
Tecnología:

- Angular.
- TypeScript.
- SCSS.

Reglas:

- Operar dentro del submodule `SmartComanda_pos` (`/home/ougt/Sources/SmartComanda/frontend-pos`), NO en otra ubicación.
- Localmente se levanta y prueba con Docker (orquestado desde el monorepo), pero los cambios de código se commitearán y empujarán SOLO en el repo `SmartComanda_pos` para que se despliegue de forma independiente.
- Usar componentes reutilizables.
- Evitar lógica compleja en componentes.
- Usar servicios para comunicación API.
- Mantener tipado fuerte.
- Aplicar buenas prácticas Angular.

Preferir:

- Standalone Components.
- Signals cuando corresponda.
- Lazy loading.
- Guards.
- Interceptors.

---

# Frontend Client

Referencia: `@frontend-client` = repo `SmartComanda_client`.

Ubicación: `/home/ougt/Sources/SmartComanda/frontend-client`
Tecnología:

- Angular.
- TypeScript.
- SCSS.

Reglas:

- Operar dentro del submodule `SmartComanda_client` (`/home/ougt/Sources/SmartComanda/frontend-client`), NO en otra ubicación.
- Localmente se levanta y prueba con Docker (orquestado desde el monorepo), pero los cambios de código se commitearán y empujarán SOLO en el repo `SmartComanda_client` para que se despliegue de forma independiente.
- Usar componentes reutilizables.
- Evitar lógica compleja en componentes.
- Usar servicios para comunicación API.
- Mantener tipado fuerte.
- Aplicar buenas prácticas Angular.

Preferir:

- Standalone Components.
- Signals cuando corresponda.
- Lazy loading.
- Guards.
- Interceptors.

---

# Base de datos

Ubicación:


/postgres


Motor:

PostgreSQL.

Reglas:

- Diseñar modelos correctamente.
- Usar claves primarias.
- Crear índices cuando sean necesarios.
- Evitar consultas ineficientes.
- No guardar información sensible sin protección.

Los cambios de esquema deben documentarse.

---

# Docker

Archivos:


docker-compose.yml

Dockerfile


Reglas:

- Todos los servicios deben poder levantarse mediante Docker.
- Mantener variables sensibles en `.env`.
- No colocar passwords reales en código.
- Usar imágenes oficiales cuando sea posible.
- Mantener servicios independientes.

---

# Seguridad

Siempre considerar:

- OWASP Top 10.
- Validación de inputs.
- Autenticación segura.
- Autorización por roles.
- Protección contra SQL Injection.
- Protección XSS.
- Manejo seguro de secretos.

Nunca:

- Hardcodear claves.
- Subir tokens.
- Exponer credenciales.

---

# Calidad del código

Todo código nuevo debe:

- Ser legible.
- Tener nombres descriptivos.
- Evitar duplicación.
- Tener manejo de errores.
- Mantener compatibilidad existente.

Antes de entregar código:

Verificar:

- ¿Compila?
- ¿Funciona?
- ¿Rompe algo existente?
- ¿Tiene impacto arquitectónico?

---

# Git

Buenas prácticas:

Commits pequeños y descriptivos.

Ejemplos:


feat: add order management module

fix: resolve authentication issue

refactor: improve product service


No modificar archivos no relacionados.

---

# Estrategia de ramas (Git Flow)

`release` es **producción**: Dokploy (VPS) despliega automáticamente la rama `release` de cada submodule (`@backend`, `@frontend-admin`, `@frontend-pos`, `@frontend-client`) en cada push. Nunca se trabaja ni se commitea directamente en `release` ni en `main`.

Ramas:

- `develop` → rama de integración por defecto para desarrollo.
- `release` → producción (la que despliega Dokploy).
- `main` → rama estable; registra lo liberado, pero **no se despliega**.
- Otras ramas `feature/*`, `fix/*`, `refactor/*` cuando el cambio lo amerite.

El monorepo `SmartComanda` no tiene rama `release` ni se despliega: lo liberado se registra en su `main` (especificaciones y punteros de submodules).

Reglas:

- Crear/commitar/pushear SOLO en `develop` (u otra rama de trabajo) tanto en el monorepo `SmartComanda` como en cada submodule.
- Liberar a producción = PR `develop` → `release` en cada submodule. Primero `@backend` (sus migraciones corren al arrancar la API) y, cuando esté desplegada, los frontends.
- Después de liberar, actualizar `main` (PR `develop` → `main`) en los submodules y en el monorepo.
- Antes de iniciar trabajo, comprobar y actualizar la rama correcta en el repositorio correspondiente (`git status` / `git branch`).
- Los submodules llevan su propia rama; no asumir que estar en `develop` del monorepo implica estar en `develop` dentro de cada submodule.

---

# Comunicación del agente

Cuando realices cambios debes indicar:

1. Qué cambiaste.
2. Por qué lo cambiaste.
3. Archivos modificados.
4. Riesgos posibles.
5. Próximos pasos recomendados.

Si falta información importante, pregunta antes de asumir.

---

# Regla principal

La prioridad siempre es:

1. Correctitud.
2. Seguridad.
3. Mantenibilidad.
4. Simplicidad.
5. Velocidad.

SmartComanda debe evolucionar como un producto profesional listo para producción.