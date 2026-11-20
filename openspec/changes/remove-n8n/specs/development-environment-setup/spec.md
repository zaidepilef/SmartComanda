## MODIFIED Requirements

### Requirement: Full stack orchestration via Docker Compose
The system SHALL provide a `docker-compose.yml` file that defines and orchestrates the backend, frontend, and database services as a single unit. The local stack SHALL consist only of PostgreSQL, pgAdmin, the API and the admin, POS and client frontends; it SHALL NOT include a workflow-automation service. Service credentials SHALL come from environment variables, never from values hardcoded in `docker-compose.yml`. A missing frontend `.env` file SHALL NOT prevent the stack or database tooling from running.

#### Scenario: Bootstrapping development environment
- **WHEN** a developer runs `docker compose up` (or `docker-compose up`)
- **THEN** all required services are started in a common network with correct configuration for local development.

#### Scenario: No workflow-automation service
- **WHEN** a developer lists the services defined in `docker-compose.yml`
- **THEN** only `postgres`, `pgadmin`, `api`, `angular_admin`, `angular_pos` and `angular_client` are defined, and no `n8n_db` database is created on PostgreSQL startup.

#### Scenario: Missing frontend env file
- **WHEN** a frontend `.env` file (for example `SmartComanda_client/.env`) does not exist and a developer runs `docker compose exec postgres …` or `npm run db:backup`
- **THEN** the command runs against PostgreSQL instead of failing on the missing file.
