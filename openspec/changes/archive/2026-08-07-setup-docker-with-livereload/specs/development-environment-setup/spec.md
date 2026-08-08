## Purpose

Provides a single entry point via Docker to bootstrap the full stack with development features like hot-reloads for the frontend.

## ADDED Requirements

### Requirement: Full stack orchestration via Docker Compose
The system SHALL provide a `docker-compose.yml` file that defines and orchestrates the backend, frontend, and database services as a single unit.

#### Scenario: Bootstrapping development environment
- **WHEN** a developer runs `docker compose up` (or `docker-compose up`)
- **THEN** all required services are started in a common network with correct configuration for local development.

### Requirement: Frontend live reload
The system SHALL ensure the frontend application automatically reloads in the browser when source files are modified during development.

#### Scenario: Hot reloading of Angular components
- **WHEN** a developer modifies an Angular component file while the container is running
- **THEN** the dev server within the Docker container detects the change and triggers a hot reload in the browser.
