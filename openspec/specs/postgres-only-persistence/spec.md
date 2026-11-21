# postgres-only-persistence Specification

## Purpose
Defines PostgreSQL as SmartComanda's only datastore: a single application database (`smartcomanda`), no MongoDB runtime, dependency or service, a stable 24-hex id format, and safe `pg_dump`/`pg_restore` backup and restore tooling.

## Requirements

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

### Requirement: Stable 24-hex identifiers
The system SHALL generate entity ids as 24-character hexadecimal strings (4-byte timestamp followed by 8 random bytes) without a MongoDB library, so ids created before and after the removal share one format and existing validation keeps accepting them.

#### Scenario: Generating an id
- **WHEN** a repository creates a new row
- **THEN** its id is a 24-character hexadecimal string accepted by the id validators.

### Requirement: PostgreSQL backup and restore
The system SHALL provide scripts that dump the application database with `pg_dump` into `backups/` and restore a chosen or latest dump with `pg_restore`, requiring explicit confirmation before a restore unless `--yes`/`--force` is passed.

#### Scenario: Creating a backup
- **WHEN** a developer runs `npm run db:backup`
- **THEN** a timestamped dump of `POSTGRES_DB` is written to `backups/`.

#### Scenario: Failed backup leaves no dump
- **WHEN** `pg_dump` fails or produces no output during `npm run db:backup`
- **THEN** the command exits with a non-zero status and no dump file is left in `backups/`.

#### Scenario: Restoring an empty dump is rejected
- **WHEN** a developer runs `npm run db:restore` and the selected dump is empty
- **THEN** the script exits with a non-zero status without touching the database.

#### Scenario: Restoring requires confirmation
- **WHEN** a developer runs `npm run db:restore` without `--yes`
- **THEN** the script asks for confirmation and aborts unless `yes` is typed.
