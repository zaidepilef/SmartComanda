# SmartComanda

**SmartComanda** es una plataforma digital pensada para restaurantes, cafeterías y negocios de comida que quieren recibir pedidos de forma automática, organizada y sin fricciones.

El cliente pide desde el celular, y tu negocio recibe el pedido al instante: ordenado, claro y sin errores.

---

## ¿Para quién es SmartComanda?

- Restaurantes y bares
- Cafeterías y panaderías
- Food trucks y dark kitchens
- Cualquier negocio de comida que reciba pedidos por WhatsApp o teléfono

---

## ¿Qué problema resuelve?

- **Adiós a los pedidos por voz perdidos:** cada pedido queda registrado por escrito, sin malentendidos.
- **El cliente pide cuando quiere:** sin llamadas, sin esperar que contestes.
- **Menos errores:** el cliente ve el menú, elige y confirma. Nada se anota de memoria.
- **Organización total:** todos los pedidos llegan a un solo lugar, ordenados y listos para preparar.
- **Atención más rápida:** menos tiempo atendiendo mensajes repetidos, más tiempo para cocinar y atender.

---

## ¿Cómo funciona para ti?

1. Publicas tu menú con fotografías de tus platos.
2. El cliente elige por WhatsApp.
3. El pedido llega a tu panel de control y lo ves con su estado.
4. Preparas, confirmas y entregas. Simple.

---

## Beneficios clave

- **Más pedidos:** atiendes a tus clientes 24/7 y no se pierde ninguna venta.
- **Menos errores:** pedidos por escrito, no por llamada.
- **Cero filas:** el cliente no tiene que esperar para pedir.
- **Control en tiempo real:** sabes siempre qué pedidos están en curso.
- **Tu marca, tu estilo:** el sistema es parte de tu negocio, no una plataforma genérica.
- **Sin depender de nadie:** tu información y tu menú son completamente tuyos.

---

## Seguridad y confianza

- Tus datos y los de tus clientes están protegidos.
- Cada pedido queda registrado con ambiente de seguridad.
- El sistema está diseñado para crecer contigo.

---

## ¿Cómo empezar?

1. **Contáctanos** y cuéntanos sobre tu negocio.
2. Configuramos tu menú y tu cuenta.
3. Empieza a recibir pedidos por WhatsApp.

Listo para que tus clientes pidan en uno demasiado clics.

---

## Variables de entorno (registro con verificación)

El registro público usa Cloudflare Turnstile ("no soy un robot") y deja la cuenta en estado `pending` hasta que un usuario del panel la apruebe.

- **Backend** (`.env` raíz): `TURNSTILE_SECRET_KEY` — clave secreta del sitio Turnstile.
- **Frontend** (`frontend-admin/src/environments/`): `turnstileSiteKey` — clave pública del sitio (`.ts` de desarrollo y producción).

Las claves Turnstile son **por dominio**: hay que crear un sitio (widget) separado en el dashboard de Cloudflare para `localhost` y para cada dominio de producción. Para desarrollo local se puede usar la clave de prueba oficial que siempre acepta: site `1x00000000000000000000AA` y secret `1x0000000000000000000000000000000AA`.

---

*SmartComanda: tu restaurante, siempre abierto para pedir.*