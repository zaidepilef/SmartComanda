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
- **Pedir por QR** Pedidos se registran medianta la captura de un QR link a PWA para pedir ordenes desde casa u oficina
- **Panel de Administracion de Comandas** Pedidos se ateinden en un KDS 
- **Administra envios por Delivery** Envia a tus clientes y comnsales y dales seguimiento al pedidos, cotiza la factibilida y el cobro de envio
- **Adiós a los pedidos por voz perdidos:** cada pedido queda registrado por escrito, sin malentendidos.
- **El cliente pide cuando quiere:** sin llamadas, sin esperar que contestes.
- **Menos errores:** el cliente ve el menú, elige y confirma. Nada se anota de memoria.
- **Organización total:** todos los pedidos llegan a un solo lugar, ordenados y listos para preparar.
- **Atención más rápida:** menos tiempo atendiendo mensajes repetidos, más tiempo para cocinar y atender.

---

## ¿Cómo funciona para ti?

1. Publicas tu menú con fotografías de tus platos con le link de la palicacion de pedidos.
2. El cliente toma su telefono captura el QR y navega por la App link PWA frontend-client y hace el pedido.
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
- **por que aveces UberEats es un pesimo negocio** controla tus envios con tus propios repartidores con comision o propinas

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

## Variables de entorno

Todo se configura desde `.env` en la raíz del proyecto (la plantilla está en `.env.example`). **Nunca comitear un `.env` real.**

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | Sí | Puerto de la API (default `3000`) |
| `BACKEND_URL` | Sí | URL pública del backend |
| `FRONTEND_URL` | Sí | URL pública del frontend |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Sí | Credenciales de PostgreSQL |
| `JWT_SECRET` | Sí | Firma de tokens JWT, mínimo 32 caracteres (`openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | No | Expiración de tokens (default `1h`) |
| `N8N_EMAIL` / `N8N_PASSWORD` | Sí | Credenciales de n8n |
| `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` | Sí | Credenciales de pgAdmin |
| `MONGODB_URI` | No | URI de MongoDB de la app (default `mongodb://localhost:27017/smartcomanda`). Cambia a Atlas sin tocar código |
| `MONGODB_PORT` | No | Puerto host de MongoDB (default `27017`) |
| `ATLAS_MONGODB_URI` | No | URI de Atlas **solo para los scripts de backup/restore** — la app nunca la lee |
| `TURNSTILE_SECRET_KEY` | No | Clave secreta Cloudflare Turnstile (registro con verificación) |

### Registro con verificación (Turnstile)

El registro público usa Cloudflare Turnstile ("no soy un robot") y deja la cuenta en estado `pending` hasta que un usuario del panel la apruebe.

- **Backend** (`.env` raíz): `TURNSTILE_SECRET_KEY` — clave secreta del sitio Turnstile.
- **Frontend** (`frontend-admin/src/environments/`): `turnstileSiteKey` — clave pública del sitio (`.ts` de desarrollo y producción).

Las claves Turnstile son **por dominio**: hay que crear un sitio (widget) separado en el dashboard de Cloudflare para `localhost` y para cada dominio de producción. Para desarrollo local se puede usar la clave de prueba oficial que siempre acepta: site `1x00000000000000000000AA` y secret `1x0000000000000000000000000000000AA`.

---

## Stack y servicios

| Servicio | URL | Descripción |
|---|---|---|
| Panel de administración | http://localhost:4200 | Frontend Angular (frontend-admin) |
| API | http://localhost:3000 | Backend Node.js/Express (`GET /health` para estado) |
| PostgreSQL | localhost:5432 | Base de datos principal (Postgres) |
| MongoDB | localhost:27017 | Base de datos de negocio (MongoDB, solo localhost) |
| pgAdmin | http://localhost:8080 | Administrador visual de PostgreSQL |
| n8n | http://localhost:5678 | Automatizaciones/Workflows |

---

## Requisitos previos

- **Docker** con Docker Compose v2.
- **Node.js 20+** (solo para desarrollo fuera de Docker; opcional si todo corre en contenedores).
- **Git**.
- Un archivo `.env` en la raíz del proyecto (ver [Variables de entorno](#variables-de-entorno)).

---

## Setup local

1. Clonar el repositorio.
2. Crear el `.env` desde la plantilla y completar los valores:

   ```bash
   cp .env.example .env
   ```

3. Levantar toda la infraestructura:

   ```bash
   docker compose up -d --build
   ```

4. Verificar el estado de la API y sus dependencias:

   ```bash
   curl http://localhost:3000/health
   # => { "status": "ok", "database": "connected" }
   ```

   El panel queda disponible en http://localhost:4200.

### Comandos útiles

```bash
docker compose up -d --build          # levantar todo
docker compose logs -f api            # logs del backend
docker compose logs -f angular_admin  # logs del panel
docker compose down                   # detener todo (los volúmenes persisten)
```

Para correr el backend fuera de Docker (desarrollo rápido con hot-reload):

```bash
cd backend
npm install
npm run dev
```

---

## MongoDB

MongoDB corre en el contenedor `smartcomanda_mongodb` (imagen oficial `mongo:8`, puerto `27017` solo accesible desde localhost).

### Conexión con MongoDB Compass

- **Local:** `mongodb://localhost:27017/smartcomanda`
- **Atlas (remoto):** `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>` — el cluster debe tener tu IP habilitada en *Network Access*.

### Cambiar entre local y Atlas (solo configuración)

La app usa una única variable `MONGODB_URI`. Para apuntar a Atlas, cambiarla en `.env` y reiniciar el contenedor `api`:

```bash
# .env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/smartcomanda
```

```bash
docker compose up -d --build api
```

### Setup de MongoDB Atlas (primer uso)

1. Crear un **cluster free** (M0) en https://www.mongodb.com/atlas.
2. Crear un **database user** con contraseña (guardar las credenciales fuera del repositorio).
3. En **Network Access**, agregar tu IP (o `0.0.0.0/0` solo para desarrollo; **nunca** en producción).
4. Copiar la cadena de conexión y ponerla en `ATLAS_MONGODB_URI` (para backups) o `MONGODB_URI` (para que la app la use). Nunca comitear credenciales reales.

---

## Backups de MongoDB

Los backups se generan con `mongodump`/`mongorestore` (herramientas oficiales) hacia la carpeta `backups/` de la raíz del proyecto (montada como `/backups` dentro del contenedor, gitignored). Todos los comandos tienen alias npm en `backend/` (`npm run db:*`).

### Lifecycle

```bash
npm run db:up        # iniciar el servicio mongodb
npm run db:down      # detener el servicio mongodb (los datos persisten)
npm run db:status    # estado del contenedor, healthcheck y ping de conectividad
```

### Backup y restore LOCAL

```bash
npm run db:backup:local                    # crea backups/smartcomanda-local-<timestamp>.archive
npm run db:restore:local                   # restaura el archive local más reciente
npm run db:restore:local -- <archivo>      # restaura un archive específico (ruta relativa a backups/)
```

### Backup y restore ATLAS

Requiere `ATLAS_MONGODB_URI` en el `.env` raíz (las credenciales nunca se guardan en el repositorio; el URI solo lo usan los scripts, nunca la app).

```bash
npm run db:backup:atlas                    # crea backups/smartcomanda-atlas-<timestamp>.archive
npm run db:restore:atlas                   # restaura el archive Atlas más reciente
npm run db:restore:atlas -- <archivo>      # restaura un archive específico
```

### DESTRUCTIVO — leer antes de restaurar

- **Restaurar sobreescribe los datos existentes**: el restore hace `--drop` (elimina las colecciones antes de restaurar). No se puede deshacer.
- Todos los restores piden confirmación explícita (escribir `yes`). Para uso no interactivo: `--yes`/`--force`.
- **Se recomienda hacer un backup justo antes de cualquier restore.**
- **Esto NO es sincronización ni replicación**: es un proceso manual de una sola vía (LOCAL ⇄ archive ⇄ ATLAS). No existe sync automático bidireccional.

---

*SmartComanda: tu restaurante, siempre abierto para pedir.*