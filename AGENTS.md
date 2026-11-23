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

- Gestión de pedidos.
- Administración de productos.
- Control operacional.
- Integración futura con WhatsApp.
- Automatización mediante n8n.
- Integración con pagos digitales.
- Administración mediante panel web.

---

# Referencias a módulos (@)

Cuando el usuario escriba una mención con `@` (p. ej. `@backend`), se refiere al repositorio/ubicación independiente de ESE módulo, NO al monorepo. Este patrón se aplicará a todos los módulos a medida que vayan separándose.

Cada módulo tiene su propio repositorio dedicado, incluido en este workspace como submódulo git:

| Módulo | Carpeta (submódulo) | Repositorio remoto |
|--------|---------------------|--------------------|
| @backend | `SmartComanda_api/` | `git@github.com:zaidepilef/SmartComanda_api.git` |
| @frontend-admin | `SmartComanda_admin/` | `git@github.com:zaidepilef/SmartComanda_admin.git` |
| @frontend-pos | `SmartComanda_pos/` | `git@github.com:zaidepilef/SmartComanda_pos.git` |
| @frontend-client | `SmartComanda_client/` | `git@github.com:zaidepilef/SmartComanda_client.git` |
| @postgres | `postgres/` (monorepo) | — |

Workspace: `/Users/ougt/Sources/SmartComanda`. No existen otras copias de estos repos.

Reglas:

- Al tocar código de un módulo `@X`, trabajar dentro de su carpeta de submódulo (p. ej. `SmartComanda_api/`).
- Commitear y empujar primero en el repo del módulo; después actualizar el puntero del submódulo en el monorepo.
- El monorepo `SmartComanda` conserva `openspec/` (especificaciones), `docker-compose.yml` (orquestación), `postgres/` y `scripts/`, que son transversales.
- Los cambios de especificación (OpenSpec) viven en el monorepo; los cambios de código de un módulo viven en su repo.

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

Ubicación: `SmartComanda_api/` (submódulo del workspace)
Tecnología:

- Node.js.
- JavaScript/TypeScript.
- API REST.

Reglas:

- Operar dentro de la carpeta `SmartComanda_api/` del workspace (es el repo `SmartComanda_api`).
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

Ubicación: `SmartComanda_admin/` (submódulo del workspace)
Tecnología:

- Angular.
- TypeScript.
- SCSS.

Reglas:

- Operar dentro de la carpeta `SmartComanda_admin/` del workspace (es el repo `SmartComanda_admin`).
- Localmente se levanta y prueba con Docker (orquestado desde el monorepo), pero los cambios de código se commitean y empujan en el repo `SmartComanda_admin` para que se despliegue de forma independiente.
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

Ubicación: `SmartComanda_pos/` (submódulo del workspace)
Tecnología:

- Angular.
- TypeScript.
- SCSS.

Reglas:

- Operar dentro de la carpeta `SmartComanda_pos/` del workspace (es el repo `SmartComanda_pos`).
- Localmente se levanta y prueba con Docker (orquestado desde el monorepo), pero los cambios de código se commitean y empujan en el repo `SmartComanda_pos` para que se despliegue de forma independiente.
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

`release` es **producción**: Dokploy (VPS Hostinger) despliega cada aplicación desde la rama `release` de su propio repositorio. Nunca se trabaja ni se commitea directamente en `release` ni en `main`.

Flujo de las ramas, en cada submódulo (`@backend`, `@frontend-admin`, `@frontend-pos`, `@frontend-client`):

```
feature/* · fix/* · refactor/*  →  develop  →  main  →  release
        (trabajo)               (integración) (estable) (producción)
```

| Rama | Rol | Cómo recibe cambios |
|------|-----|---------------------|
| `feature/*`, `fix/*`, `refactor/*` | Trabajo de cada cambio | Commits directos |
| `develop` | Integración para desarrollo | PR desde las ramas de trabajo |
| `main` | Rama estable, ya revisada | PR desde `develop` |
| `release` | **Producción** (la despliega Dokploy) | PR desde `main`, solo al liberar |

Reglas:

- Commitear y pushear SOLO en `develop` o en ramas de trabajo (`feature/*`, `fix/*`, `refactor/*`), tanto en el monorepo como en cada submódulo.
- `main` y `release` solo reciben cambios por PR con **"Create a merge commit"** (no squash ni rebase), para que los punteros de submódulo del monorepo no queden huérfanos.
- Liberar a producción = PR de `main` a `release` en el repo del módulo. Dokploy redespliega esa aplicación al detectar el cambio en `release`.
- Nunca hacer force-push a `main` ni a `release`.
- Antes de iniciar trabajo, comprobar y actualizar la rama correcta en el repositorio correspondiente (`git status` / `git branch`).
- Los submódulos llevan su propia rama; no asumir que estar en una rama del monorepo implica estar en la misma dentro de cada submódulo.
- El monorepo no tiene rama `release`: no se despliega; solo guarda especificaciones, orquestación local y punteros de submódulo.

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