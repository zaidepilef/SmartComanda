## Purpose

Provides SmartComanda with a complete MongoDB infrastructure: a local development database via Docker, backend connection with health reporting, environment-driven switching between local and MongoDB Atlas, and controlled backup/restore workflows.

## ADDED Requirements

### Requirement: MongoDB local service via Docker Compose
The system SHALL define a `mongodb` service in `docker-compose.yml` using the official MongoDB image (8.x series), joined to the existing Docker network, with a named volume for persistence, a healthcheck, a stable service name reachable from other containers, and a configurable host port (default `27017`) for external clients such as MongoDB Compass.

#### Scenario: Starting local MongoDB
- **WHEN** a developer runs `docker compose up -d mongodb` (or the full `docker compose up -d`)
- **THEN** the `mongodb` container starts, becomes healthy, and is reachable on the host port.

#### Scenario: Persisting data across restarts
- **WHEN** a document is written to local MongoDB, the container is stopped, and later started again with `docker compose up -d mongodb`
- **THEN** the written document is still present and retrievable.

#### Scenario: Connecting from other containers
- **WHEN** a service inside the Docker network resolves the database host
- **THEN** the stable service name `mongodb` resolves to the running container on port `27017`.

### Requirement: Backend connection via MONGODB_URI
The backend SHALL connect to MongoDB at startup using a single `MONGODB_URI` environment variable, without hardcoding connection strings in source code.

#### Scenario: Connecting to local MongoDB
- **WHEN** the backend starts with `MONGODB_URI=mongodb://mongodb:27017/smartcomanda` (or `mongodb://localhost:27017/smartcomanda` outside Docker)
- **THEN** the backend establishes a connection to the local database before serving requests.

#### Scenario: Failing to connect
- **WHEN** the backend starts with an unreachable or invalid `MONGODB_URI`
- **THEN** the backend logs a clear connection error and does not silently continue with a degraded or absent connection.

### Requirement: Health check endpoint reporting database state
The system SHALL expose a health check endpoint on the Express API that reports the application and MongoDB connection state.

#### Scenario: Healthy database connection
- **WHEN** a client requests the health check endpoint while MongoDB is reachable
- **THEN** the response reports the API as online and the database connection state as connected (e.g., HTTP 200 with a `database` status field).

#### Scenario: Unhealthy database connection
- **WHEN** a client requests the health check endpoint while MongoDB is unreachable
- **THEN** the response reports the degraded state (e.g. HTTP 503 with the database status flagged as disconnected), indicating the API cannot operate fully.

### Requirement: Switching between local and Atlas with configuration only
The system SHALL support MongoDB Atlas as the remote database without any code change, by supplying a `mongodb+srv://` URI via `MONGODB_URI`.

#### Scenario: Connecting to MongoDB Atlas
- **WHEN** the backend starts with `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/smartcomanda` from the environment
- **THEN** the backend connects to the Atlas cluster and the health check reports the connection state.

#### Scenario: Never storing Atlas credentials in the repository
- **WHEN** MongoDB Atlas credentials are required for execution
- **THEN** they are provided exclusively through environment variables (`MONGODB_URI` for the application and `ATLAS_MONGODB_URI` for the backup/restore scripts) and never stored in tracked files, with `.env.example` documenting only placeholders.

### Requirement: Controlled backup and restore via official MongoDB tools
The system SHALL provide scripts using `mongodump` and `mongorestore` for one-way, manually invoked backups between environments (LOCAL → backup archive, ATLAS → backup archive, and restores in both directions), without any automatic bidirectional replication.

#### Scenario: Backing up local MongoDB
- **WHEN** a developer runs the backup script for the local database
- **THEN** a compressed dump is created in the configured backup directory and the script reports success with the produced artifact path.

#### Scenario: Restoring local MongoDB
- **WHEN** a developer runs the restore script pointing at an existing dump
- **THEN** the dump contents are restored into the local database, replacing the current data as documented (destructive operation).

#### Scenario: Backing up MongoDB Atlas
- **WHEN** a developer runs the backup script for the Atlas target with credentials from the environment
- **THEN** a compressed dump is created locally from the Atlas cluster without any credential being stored in the repository.

#### Scenario: Restoring to MongoDB Atlas
- **WHEN** a developer runs the restore script for Atlas against an existing dump
- **THEN** the dump contents are restored into the Atlas cluster (destructive operation, requiring explicit confirmation before execution).

#### Scenario: Warning about destructive commands
- **WHEN** a developer consults the scripts documentation
- **THEN** destructive commands (restores) are explicitly marked and require confirmation before executing.

### Requirement: Docker lifecycle scripts for MongoDB infrastructure
The system SHALL provide npm or shell commands to start, stop, and check the MongoDB infrastructure of SmartComanda.

#### Scenario: Starting and stopping infrastructure
- **WHEN** a developer runs the start command
- **THEN** the MongoDB container starts and becomes healthy; when the developer runs the stop command, the container stops without losing persisted data.

#### Scenario: Checking MongoDB status
- **WHEN** a developer runs the status command
- **THEN** the command reports whether the MongoDB container is running, healthy or unhealthy, and reachable from the host.

### Requirement: Existing functionality remains operational
The system SHALL NOT modify the behavior of existing services (Postgres, pgAdmin, n8n, admin frontend) or business functionality while adding the MongoDB infrastructure.

#### Scenario: Existing stack still boots
- **WHEN** a developer runs `docker compose up -d` after the change
- **THEN** all previously existing services start normally alongside the new `mongodb` service.