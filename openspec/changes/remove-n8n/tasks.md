## 1. Orchestration

- [x] 1.1 Remove the `n8n` service and `smartcomanda_n8n_data` volume from `docker-compose.yml`; verify `docker compose config --services` lists only postgres, pgadmin, api, angular_admin, angular_pos, angular_client
- [x] 1.2 Make the frontend `env_file` entries optional (`required: false`); verify `docker compose config -q` passes with `SmartComanda_client/.env` absent

## 2. Database bootstrap

- [x] 2.1 Stop creating `n8n_db` in `postgres/init.sql` and `postgres/init.d/00_core_databases.sql`; verify `grep -ri n8n postgres/` returns nothing

## 3. Config and docs

- [x] 3.1 Remove `N8N_EMAIL` / `N8N_PASSWORD` from `.env.example`; verify `grep -i n8n .env.example` returns nothing
- [x] 3.2 Remove n8n variable and service rows from `README.md`; verify `grep -i n8n README.md` returns nothing

## 4. Verification

- [x] 4.1 `docker compose up -d --remove-orphans` removes the n8n container; admin (4200), POS (4201), client (4202), API `/health` and pgAdmin respond 200
- [ ] 4.2 Remove orphaned local data (`docker volume rm smartcomanda_n8n_data`, `DROP DATABASE n8n_db`) — verified empty before deletion (0 workflows, 0 credentials, 0 users); manual step for each existing environment
