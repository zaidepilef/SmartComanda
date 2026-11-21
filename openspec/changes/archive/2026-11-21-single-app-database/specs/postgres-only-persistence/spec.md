## MODIFIED Requirements

### Requirement: PostgreSQL as the single datastore
The system SHALL persist all application data in PostgreSQL and SHALL NOT depend on MongoDB at runtime, in its dependencies, or in its orchestration. All application data SHALL live in a single PostgreSQL database named `smartcomanda`; database bootstrap, environment templates and the API configuration SHALL all reference that same database, and bootstrap SHALL NOT create any other application database.

#### Scenario: No MongoDB dependency in the API
- **WHEN** the backend dependencies and sources are inspected
- **THEN** there is no `mongodb` package dependency and no module imports a MongoDB client.

#### Scenario: No MongoDB service in orchestration
- **WHEN** a developer runs `docker compose up -d`
- **THEN** no MongoDB container is started and the API starts with only PostgreSQL available.

#### Scenario: Environment template targets the application database
- **WHEN** a developer creates `.env` from `.env.example` and starts the stack
- **THEN** the API connects to the `smartcomanda` database.

#### Scenario: Bootstrap creates only the application database
- **WHEN** PostgreSQL starts and runs its bootstrap scripts
- **THEN** the `smartcomanda` database exists and no other application database is created.
