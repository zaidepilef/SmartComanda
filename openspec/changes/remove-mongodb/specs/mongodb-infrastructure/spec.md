## REMOVED Requirements

### Requirement: MongoDB local service via Docker Compose
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Backend connection via MONGODB_URI
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Health check endpoint reporting database state
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Switching between local and Atlas with configuration only
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Controlled backup and restore via official MongoDB tools
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Docker lifecycle scripts for MongoDB infrastructure
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).

### Requirement: Existing functionality remains operational
**Reason**: MongoDB is no longer part of the architecture; all data lives in PostgreSQL.
**Migration**: See `postgres-only-persistence` (PostgreSQL backup/restore, health check on PostgreSQL).
