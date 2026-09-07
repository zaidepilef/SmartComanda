## Why

El frontend-client (menú público por QR) solo tiene tema claro fijo con tokens duplicados y colores hardcodeados. En horarios de baja luz o dispositivos configurados en modo oscuro, la experiencia es incómoda. Un modo oscuro con paleta monocromática naranja mejora la comodidad visual manteniendo la identidad de marca.

## What Changes

- Agregar modo oscuro al frontend-client con paleta monocromática naranja (un solo hue, escala de tonos).
- Toggle manual (luna/sol) en la UI, con preferencia del sistema como default y persistencia en `localStorage`.
- Centralizar tokens de tema en `_tokens.scss` (eliminar la re-declaración en `order-flow.scss`).
- Tokenizar colores hardcodeados (errores, badge de puntos, overlay) para que funcionen en ambos temas.
- Aplicar el tema antes del primer render (script inline en `index.html`) para evitar flash de tema claro (FOUC).
- Jerarquía visual: los elementos importantes (CTA, precio, número de pedido) usan el tono de máximo contraste contra el fondo — el más oscuro en light, el más luminoso en dark.

## Capabilities

### New Capabilities

- `client-theme`: Tema claro/oscuro del frontend-client con paleta monocromática naranja, toggle manual, preferencia del sistema y persistencia.

### Modified Capabilities

- `public-menu`: el menú público (order-flow) se renderiza en ambos temas sin colores hardcodeados.

## Impact

- `frontend-client/src/app/_tokens.scss`: tokens de tema (light/dark).
- `frontend-client/src/app/views/order-flow/`: SCSS de la vista (usar tokens, quitar duplicados y hardcodes) y header con botón de tema.
- `frontend-client/src/app/views/qr-landing/`: SCSS mínimo (solo tokens).
- Nuevo `theme.service.ts` (signal + localStorage + `prefers-color-scheme`) y botón de toggle.
- `frontend-client/src/index.html`: script inline anti-FOUC.
- Sin cambios de API ni dependencias nuevas.