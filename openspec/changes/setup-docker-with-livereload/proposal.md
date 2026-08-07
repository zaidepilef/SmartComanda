## Why

The goal is to provide a convenient way to spin up the entire SmartComanda stack (backend, frontend-admin, and postgres) using Docker Compose. Currently, there isn't a unified command that ensures all services are running with appropriate configurations for development, specifically including live reloading for the Angular frontend.

## What Changes

- Update `docker-compose.yml` to ensure all necessary services are well-defined.
- Configure the frontend-admin service to use a watcher (e.g., `ng serve`) for live reload.
- Ensure environment variables for local development are correctly handled.
- Verify that the frontend properly connects to the backend and database within the Docker network.

## Capabilities

### New Capabilities
- `development-environment-setup`: Provides a single entry point via Docker to bootstrap the full stack with dev features (hot reload).

### Modified Capabilities
- 

## Impact

- Infrastructure configuration in `docker-compose.yml`.
- Deployment scripts/commands for development.
- Local environment setup for new contributors.
