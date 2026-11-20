## Why

n8n was bundled in the local stack in anticipation of WhatsApp/workflow automation, but no workflow, credential or user was ever created in it (`n8n_db`: 0 workflows, 0 credentials, 0 users). It adds an extra container, a dedicated database, two required environment variables and hardcoded database credentials (`admin`/`admin123`) in `docker-compose.yml`. Automation is not on the near-term roadmap, so the stack should only contain what SmartComanda actually runs today.

## What Changes

- **Orchestration**: remove the `n8n` service and the `smartcomanda_n8n_data` volume from `docker-compose.yml` (this also removes the hardcoded `admin`/`admin123` credentials).
- **Database bootstrap**: `postgres/init.sql` and `postgres/init.d/00_core_databases.sql` no longer create the `n8n_db` database.
- **Config/docs**: remove `N8N_EMAIL` / `N8N_PASSWORD` from `.env.example` and the n8n rows (variables, service URL `:5678`) from `README.md`.
- **Robustness**: the per-frontend `env_file` entries (`SmartComanda_admin/.env`, `SmartComanda_pos/.env`, `SmartComanda_client/.env`) become optional, so a missing frontend `.env` no longer breaks unrelated `docker compose` commands (e.g. `docker compose exec postgres …` used by `db:backup`/`db:restore`).
- **BREAKING (ops)**: `http://localhost:5678` is no longer available. Existing `smartcomanda_n8n_data` volumes and `n8n_db` databases are orphaned and must be removed manually.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `development-environment-setup`: the full-stack orchestration requirement now enumerates the services of the local stack (no workflow-automation service) and requires that missing frontend `.env` files do not prevent the stack or its database tooling from running.

## Impact

- Monorepo only: `docker-compose.yml`, `postgres/init.sql`, `postgres/init.d/00_core_databases.sql`, `.env.example`, `README.md`.
- No module code (`@backend`, `@frontend-*`) references n8n; no API or UI behavior changes.
- `AGENTS.md` keeps "Automatización mediante n8n" as a future product goal; reintroducing it will require its own change.
- Local cleanup for existing environments: `docker volume rm smartcomanda_n8n_data` and `DROP DATABASE n8n_db`.
