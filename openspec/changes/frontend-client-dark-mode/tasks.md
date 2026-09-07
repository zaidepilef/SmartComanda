## 1. Tokens y tema

- [x] 1.1 Definir en `_tokens.scss` la escala naranja monocromática y los tokens por tema (`:root` light, `:root[data-theme="dark"]`, media query para system sin `data-theme`)
- [x] 1.2 Crear `theme.service.ts` con signal `theme()`, lectura de `localStorage` (`sc-theme`), listener de `prefers-color-scheme` y aplicación de `data-theme` en `<html>`
- [x] 1.3 Proporcionar el service globalmente en `app.config.ts`
- [x] 1.4 Agregar script inline anti-FOUC en `src/index.html` (lee localStorage + media query antes del bootstrap)

## 2. UI del toggle

- [x] 2.1 Crear componente `theme-toggle` (botón luna/sol) que cicla `light → dark → system` vía el service
- [x] 2.2 Integrar el toggle en la pantalla de bienvenida (qr-landing / step phone)
- [x] 2.3 Integrar el toggle en el header del menú (order-flow `menu-header`)

## 3. Adaptar vistas a tokens

- [x] 3.1 Refactorizar `order-flow.scss`: eliminar re-declaración de tokens en `:host` y reemplazar colores fijos (`.field-error`, `.points-label`, `.global-error`, `.overlay`) por tokens de tema
- [x] 3.2 Ajustar `qr-landing.scss` para usar solo tokens
- [x] 3.3 Verificar jerarquía visual en ambos temas (CTA, precios, número de pedido con tonos de contraste máximo)

## 4. Validación

- [x] 4.1 Verificar build del frontend-client (`npm run build` o compilación en contenedor sin errores TS/SCSS)
- [x] 4.2 Probar en navegador: default por sistema, toggle manual, persistencia tras reload, cambio de sistema en vivo y ausencia de FOUC
- [x] 4.3 Verificar contraste WCAG de `--muted` y texto sobre superficies en dark; ajustar tonos si es necesario