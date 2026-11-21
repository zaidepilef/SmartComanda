# Handoff: deploy de SmartComanda en Hostinger (VPS)

> Documento para el agente que hará el deploy. Describe el estado real del repo al
> **2026-11-21**, lo que falta para producción y las decisiones pendientes.
> **No contiene credenciales**: están en `CREDENCIALES-LOCAL.md` (raíz del workspace,
> solo en la máquina local, excluido de git).

---

## 1. Antes de empezar

1. Lee `AGENTS.md`. Reglas clave:
   - **SDD/OpenSpec:** el deploy es un cambio grande. Crea primero un cambio OpenSpec
     (p. ej. `production-deployment`) con `/opsx-propose` y especifica antes de implementar.
   - **Submódulos:** el código de cada módulo se commitea y empuja en **su** repo; después se
     actualiza el puntero en el monorepo.
   - **Seguridad:** nada de secretos en código ni en git; `.env` real solo en el servidor.
2. Rama de trabajo actual: `feat/postgres-only` en el monorepo y en `SmartComanda_api`.
   - Merge pendiente: **primero** `SmartComanda_api`, **después** el monorepo.
   - Usar **"Create a merge commit"** (no squash/rebase): el monorepo apunta a commits concretos
     del submódulo (`d7535f8`); con squash quedarían huérfanos.
3. Specs vigentes relevantes: `openspec/specs/postgres-only-persistence`,
   `openspec/specs/development-environment-setup`.

## 2. Qué se despliega

| Servicio | Repo / carpeta | Tecnología | Puerto interno | Imagen de producción |
|---|---|---|---|---|
| API | `SmartComanda_api/` | Node 22 + Express 5 | 3000 | **No existe aún** (ver §5.1) |
| Admin | `SmartComanda_admin/` | Angular → nginx | 80 | stage final del `Dockerfile` |
| POS | `SmartComanda_pos/` | Angular → nginx | 80 | stage final del `Dockerfile` |
| Cliente QR (PWA) | `SmartComanda_client/` | Angular → nginx | 80 | stage final del `Dockerfile` |
| PostgreSQL | `postgres/` (monorepo) | `postgres:16` | 5432 | oficial |
| pgAdmin | — | `dpage/pgadmin4` | 80 | **no desplegar en producción** (o solo por túnel SSH) |

- **PostgreSQL es el único datastore** (MongoDB y n8n fueron eliminados). Una sola base: **`smartcomanda`**.
- El esquema se crea solo: la API aplica `src/migrations-pg/` al arrancar (`schema_migrations`).
- `GET /health` → `200 {"status":"ok","database":"connected"}` o `503` si Postgres no responde.

## 3. Acceso al servidor

- Clave SSH dedicada: `~/.ssh/id_ed25519_hostinger` (passphrase en el llavero de macOS, ya cargada en el agente).
- Alias: `ssh hostinger` en `~/.ssh/config` (IP, usuario y host key en `CREDENCIALES-LOCAL.md`). Conexión verificada el 2026-11-21.

### Estado del VPS (relevado el 2026-11-21, solo lectura)

| Aspecto | Estado |
|---|---|
| Sistema | Debian GNU/Linux 13 (trixie), kernel 6.12 |
| Recursos | 2 vCPU · 7,8 GiB RAM · 99 GB de disco (2 % usado) |
| Docker / Compose | **No instalados** |
| Puertos abiertos | `22` (SSH) y `5355` (LLMNR de systemd-resolved, expuesto en `0.0.0.0`) |
| Firewall | **Ninguno** (sin ufw, sin reglas nftables) |
| fail2ban | **No instalado** |
| SSH efectivo (`sshd -T`) | `permitrootlogin yes`, **`passwordauthentication yes`** |

**Endurecer antes de desplegar nada** (orden recomendado, sin cerrarse el acceso):
1. Crear un usuario de deploy con `sudo` y copiarle la clave pública; probar el login con ese usuario **en una sesión aparte** antes de seguir.
2. `PasswordAuthentication no`: el `sshd_config` principal ya lo dice, pero `/etc/ssh/sshd_config.d/50-cloud-init.conf` lo pisa con `yes` (el primer valor leído gana y ese archivo se incluye primero). Corregir el drop-in, validar con `sshd -t` y recargar.
3. `PermitRootLogin no` (o `prohibit-password` como paso intermedio).
4. Firewall: permitir solo `22`, `80` y `443` (`ufw` o `nftables`).
5. Instalar `fail2ban` y deshabilitar LLMNR (`LLMNR=no` en `resolved.conf`).
6. Instalar Docker Engine y el plugin Compose desde el repositorio oficial de Docker para Debian.

## 4. Configuración de producción (`.env` del servidor)

Generar valores **nuevos** (nunca reutilizar los de desarrollo):

| Variable | Valor en producción |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `POSTGRES_USER` | usuario dedicado (no `admin`) |
| `POSTGRES_PASSWORD` | `openssl rand -base64 32` |
| `POSTGRES_DB` | `smartcomanda` |
| `JWT_SECRET` | `openssl rand -base64 48` (mín. 32 caracteres) |
| `JWT_EXPIRES_IN` | `1h` |
| `ENABLE_API_DOCS` | `false` (Swagger apagado; por defecto ya se apaga con `NODE_ENV=production`) |
| `TURNSTILE_SECRET_KEY` | clave real de Cloudflare Turnstile (ver §5.9) |
| `SYSADMIN_EMAIL` | definir explícitamente (el código trae un default en `src/config/env.js`) |

Permisos: `chmod 600 .env`, propietario el usuario de deploy.

## 5. Brechas que bloquean producción

Verificadas en el código el 2026-11-21. Resolver dentro del cambio OpenSpec de deploy.

| # | Problema | Dónde | Qué hacer |
|---|---|---|---|
| 5.1 | La imagen de la API corre en **modo desarrollo**: `npm install` con devDependencies y `CMD npm run dev` (`node --watch`). | `SmartComanda_api/Dockerfile` | Stage de producción: `npm ci --omit=dev`, `NODE_ENV=production`, `CMD ["node","src/server.js"]`, usuario no root. |
| 5.2 | **La API escribe en el log la contraseña de la base**: `PostgreSQL connected: ${env.databaseUrl}`. | `SmartComanda_api/src/server.js:54` | Loguear solo host/db, nunca la URL completa. |
| 5.3 | **CORS abierto** a cualquier origen: `app.use(cors())`. | `SmartComanda_api/src/server.js:22` | Lista blanca con los dominios reales de admin, POS y cliente. |
| 5.4 | **Login sin rate limit** (fuerza bruta). Solo `/api/public` tiene `publicRateLimit`. | `src/routes/auth.js`, `src/middleware/rateLimit.js` | Aplicar límite a `/api/auth/login` y `/register`. |
| 5.5 | El rate limit usa `req.ip`, pero no hay `trust proxy`: detrás de un reverse proxy todos los clientes comparten IP. Además es en memoria (se pierde al reiniciar). | `src/middleware/rateLimit.js`, `src/server.js` | `app.set("trust proxy", 1)` cuando haya proxy. |
| 5.6 | `docker-compose.yml` es **solo de desarrollo**: bind mounts del código, `ng serve`, Postgres publicado en `5432` y pgAdmin en `8080` hacia afuera. | `docker-compose.yml` | Crear `docker-compose.prod.yml`: imágenes de build, sin bind mounts, Postgres sin puerto público, sin pgAdmin, `restart: unless-stopped`. |
| 5.7 | **Dominios de la API inconsistentes** entre frontends. | admin `environment.prod.ts`: `https://api.smartcomanda.online` · cliente: `https://api.smartcomanda.cl` · POS: placeholders `${APIURL}` | Decidir el dominio (§8) y unificar. |
| 5.8 | El **POS** solo resuelve `${APIURL}`/`${PUBLICURL}` en su workflow de GitHub Pages; en un build Docker quedan literales. Admin y POS se publican hoy en **GitHub Pages** (`.github/workflows/node.js.yml`, `base-href /SmartComanda_*/`). | `SmartComanda_pos/src/environments/*`, workflows | Definir un mecanismo único (build args o `envsubst` en el arranque de nginx) y decidir si GitHub Pages sigue. |
| 5.9 | **Captcha desactivado** en el registro (está comentado) y los frontends usan la clave de prueba de Turnstile `1x00000000000000000000AA`. | `src/controllers/authController.js` (register), `environment*.ts` | Reactivar `verifyTurnstileToken` con claves reales antes de abrir el registro público. |
| 5.10 | `base-href` inconsistente: admin usa `/frontend-admin/` en el Dockerfile y `/SmartComanda_admin/` en GitHub Pages. POS y cliente **no tienen `nginx.conf`** (sin fallback SPA: las rutas profundas dan 404 al recargar). | Dockerfiles, `SmartComanda_admin/nginx.conf` | Unificar el path (o un subdominio por app) y agregar `try_files ... /index.html` a POS y cliente. |
| 5.11 | El healthcheck de Postgres tiene el usuario hardcodeado: `pg_isready -U admin`. | `docker-compose.yml` | Usar `$${POSTGRES_USER}`. |
| 5.12 | El `entrypoint.sh` de Postgres y `postgres/init.d/` crean la base en cada arranque (idempotente). | `postgres/` | Reusar en prod; verificar que solo cree `smartcomanda`. |

## 6. Arquitectura sugerida en el VPS

```
Internet ──443──> Reverse proxy (Caddy o Traefik, TLS Let's Encrypt automático)
                     ├── api.<dominio>     → api:3000
                     ├── admin.<dominio>   → admin:80
                     ├── pos.<dominio>     → pos:80
                     └── <dominio> (QR)    → client:80
                  Red interna Docker: api ──> postgres:5432 (sin puerto público)
```

- Firewall: abrir solo `22`, `80` y `443` (`ufw`). SSH solo con clave; deshabilitar login por contraseña y, si es posible, el de `root`.
- Un subdominio por app evita los problemas de `base-href` (§5.10).
- Logs: `docker compose logs`, con rotación configurada (`max-size`/`max-file`).

## 7. Base de datos

- Solo `smartcomanda`. Las migraciones corren solas al arrancar la API.
- **Backups:** `scripts/db-backup.sh` / `db-restore.sh` (`pg_dump -Fc`). Descartan dumps vacíos y piden confirmación al restaurar (`--yes` para no interactivo). En el servidor: cron diario y copia **fuera** del VPS.
- **Datos iniciales:** decidir (§8) si se migra la base local (`pg_dump` local → `pg_restore` en el servidor) o se parte vacía y se crea el primer sysadmin.
- Los `backups/*.dump` están en `.gitignore`: nunca commitear dumps.

## 8. Decisiones pendientes (preguntar al usuario)

1. **Dominio** definitivo: `smartcomanda.online` o `smartcomanda.cl`, y subdominios por app vs. paths.
2. **Datos:** migrar la base local `smartcomanda` o empezar vacía.
3. **Frontends:** todo en el VPS o mantener GitHub Pages para admin y POS.
4. **Usuario de deploy:** nombre del usuario no root que reemplazará a `root` (§3).
5. **CI/CD:** deploy manual por SSH o GitHub Actions (requiere una clave de deploy distinta, guardada como secret).

## 9. Checklist post-deploy

- [ ] `https://api.<dominio>/health` → `{"status":"ok","database":"connected"}`
- [ ] `https://api.<dominio>/api/docs` → **404** (Swagger apagado)
- [ ] Logs de la API sin `DATABASE_URL` ni contraseñas
- [ ] CORS: una petición desde un origen no listado es rechazada
- [ ] Login funciona desde admin y POS; el menú público carga desde un QR
- [ ] Postgres **no** es accesible desde internet (`nc -zv <ip> 5432` falla)
- [ ] Backup diario ejecutado y restaurado al menos una vez en un entorno de prueba
- [ ] Certificados TLS válidos y con renovación automática
- [ ] Colección Postman (`postman/`) corrida contra producción con un usuario de prueba

## 10. Referencias

- `README.md`: levantar el stack local y scripts de backup.
- `postman/SmartComanda-API.postman_collection.json`: 43 requests, todas las rutas de la API.
- `SmartComanda_api/MIGRATION.md`: historia de la migración de Mongo a PostgreSQL.
- `CREDENCIALES-LOCAL.md` (solo local): credenciales de desarrollo y datos de la clave de Hostinger.
