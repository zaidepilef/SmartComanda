## Context

El frontend-client es una SPA Angular standalone con dos vistas (`qr-landing`, `order-flow`). Los tokens viven en `_tokens.scss` (`:root`) pero `order-flow.scss` los re-declara en su `:host`. Hay colores fijos (errores, badge de puntos, overlay) que no sobrevivirían un dark mode. No hay servicio de tema ni persistencia. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Un sistema de tokens por tema (light/dark) centralizado en `_tokens.scss`, sin duplicación en vistas.
- Toggle manual luna/sol con persistencia en `localStorage` y default por `prefers-color-scheme`.
- Tema aplicado antes del primer paint (sin FOUC).
- Paleta monocromática naranja: jerarquía por contraste máximo (oscuro en light, luminoso en dark).

**Non-Goals:**
- Aplicar dark mode a frontend-admin o frontend-pos (el token system queda listo para reutilizarse, pero no se replica ahora).
- Cambios en la API, el modelo de datos o el backend.
- Personalización de color por tenant.

## Decisions

### 1. Tokens por tema con `data-theme` + media query
`_tokens.scss` define los tokens en `:root` (light) y en `:root[data-theme="dark"]` (dark). El `@media (prefers-color-scheme: dark)` solo aplica dark cuando NO hay `data-theme` explícito (regla `:root:not([data-theme="light"])`), para que el toggle manual tenga prioridad sobre el sistema.

- Se elige `data-theme` sobre clases en `body` porque es el patrón estándar, funciona con el script anti-FOUC y es trivial de extender al POS/admin.
- `order-flow.scss` y `qr-landing.scss` pasan a usar solo tokens (se elimina la re-declaración de `:host`).

### 2. Paleta naranja monocromática (escala única de hue)
Se define una escala de tonos de naranja (derivada del accent actual `#e74c1e` → `#c2410c`/`#ea580c`):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#fff7ed` (50) | `#431407` (950) |
| `--surface` | `#ffffff` | `#7c2d12` (900) |
| `--ink` | `#7c2d12` (900) | `#ffedd5` (100) |
| `--muted` | `#c2410c` (700) al 60% | `#fdba74` (300) |
| `--accent` | `#c2410c` (700) | `#f97316` (500) |
| `--accent-contrast` | `#ffffff` | `#431407` (950) |
| `--border` | `#ffedd5` (100) | `#9a3412` (800) |
| `--shadow` | sombra oscura suave | sombra negra más profunda |
| `--error` | `#c0392b` | `#f87171` |
| `--badge-bg` / `--badge-ink` | `#fff3d6` / `#8a5a00` | `#78350f` / `#fde68a` |
| `--overlay` | `rgb(0 0 0 / 45%)` | `rgb(0 0 0 / 60%)` |

Jerarquía: en light el CTA y los precios usan los tonos 700-800 (lo más oscuro del hue); en dark usan 400-500 (lo más luminoso), invirtiendo la escala para mantener contraste máximo contra el fondo 950.

### 3. `theme.service.ts` con signals
Service global (provisto en `app.config.ts`) que:
- Expone `theme()` signal (`'light' | 'dark' | 'system'`, default `'system'`).
- Lee `localStorage` (`sc-theme`) al inicializar; si es `system`, escucha `matchMedia('(prefers-color-scheme: dark)')` y reacciona a cambios en vivo.
- Aplica `document.documentElement.dataset.theme = 'dark' | 'light'` (o lo elimina para system).
- `setTheme(t)` guarda en localStorage y re-aplica.

### 4. Script anti-FOUC inline en `index.html`
Un script de pocas líneas en `<head>` lee `localStorage` y `prefers-color-scheme` antes de que Angular cargue, y setea `data-theme` en `<html>`. Así la primera pintura ya tiene el tema correcto y el service confirma/refresca al arrancar.

### 5. Toggle en la UI
Botón compacto (luna/sol) en el header del menú (`menu-header` del order-flow) y en la pantalla de bienvenida (esquina superior). Cicla `light → dark → system`. Es un botón plano con emoji, sin dependencias nuevas.

## Risks / Trade-offs

- **Contraste WCAG**: el texto `--muted` en dark (naranja 300 sobre 950) bordea 4.5:1; se verificará con medición y se ajustará el tono si no alcanza.
- **Prioridad toggle vs sistema**: si el usuario eligió manual y el dispositivo cambia, el manual gana (decisión intencional); puede sorprender a quien esperaba "seguir al sistema" siempre.
- **Badge de puntos**: el amber de dark reduce el brillo del ⭐; aceptable, es un elemento secundario.
- **Script anti-FOUC duplicado en index.html y service**: riesgo de desincronización; se mantiene el script mínimo (solo data-theme) y el service como única fuente de lógica de tema.