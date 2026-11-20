## REMOVED Requirements

### Requirement: Versioned schema migrations
**Reason**: It described MongoDB migrations tracked in a `migrations` collection, including a Mongo-only role backfill that no longer exists.
**Migration**: Versioned migrations are specified by `identity-postgres-storage` ("Versioned SQL migrations run on startup"): PostgreSQL migrations in `src/migrations-pg/`, tracked in `schema_migrations`.
