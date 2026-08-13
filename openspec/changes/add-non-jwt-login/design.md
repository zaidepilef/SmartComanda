## Context

The current system relies on JWT for authentication. To accommodate environments or tools that do not support JWT verification, we are introducing a non-JWT login flow as described in proposal.md.

## Goals / Non-Goals

**Goals:**
- Implementation of a session-based or simplified token authentication.
- Support for both JWT and non-JWT paths on the backend.
- A dedicated frontend entry point/route for the non-JWT flow.

**Non-Goals:**
- Migrating all existing users to non-JWT (unless specifically requested).
- Supporting multiple types of non-JWT tokens simultaneously in one request.

## Decisions

- **Dual Auth Support**: The backend will check a header or query parameter to determine which authentication logic to use. 
- **Cookie-based Sessions**: For non-JWT, we will use standard session cookies to maintain state on the server/cache.
- **Frontend Routing**: A specific component will handle the simplified form to ensure clear separation from the primary JWT flow.

## Risks / Trade-offs

- [Security Risk] Less secure if not properly scoped: Mitigated by enforcing strict IP ranges or internal network checks for non-JWT requests.
- [Complexity] Maintaining two login paths: Accepted as a necessary step for compatibility during transition phase.
