## Context

The current system lacks a unified configuration to run the entire stack (backend, frontend-admin, and database) with local development features like hot-reloading in one command. Reference proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a single `docker-compose.yml` to orchestrate all services.
- Enable automatic frontend reloading using an Angular watcher within the container.
- Ensure proper connectivity between all local components (Frontend -> Backend -> DB).

**Non-Goals:**
- Production build optimization (this is for development config).
- Migrating production data into a new schema.

## Decisions

1. **Use `ng serve` with polling/watcher**: Since the frontend code resides in a volume, we will ensure the Angular CLI detects changes to trigger HMR.
2. **Separate environment files**: Use `.env` or similar for hostnames (e.g., backend API URL) to ensure it works both inside and outside the Docker network.

## Risks / Trade-offs

[Slow Hot Reload] -> Mitigation: Ensure standard file watching is used where possible, but note that some OS/Filesystem combinations may require polling.
