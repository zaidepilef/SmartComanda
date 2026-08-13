## Why

The current implementation uses JWT for authentication. To simplify the initial rollout and integration with other services that may not support JWT verification, a fallback or alternative non-JWT (e.g., session-based or simple token) login flow is planned.

## What Changes

- Implement a simplified backend logic to handle login without requiring a JWT.
- Create a frontend login page that supports this new flow.
- Update the backend configuration to allow for both types of sessions if applicable.

## Capabilities

### New Capabilities
- `non-jwt-auth`: A simplified authentication mechanism that doesn't rely on JSON Web Tokens, providing easier integration for local or internal operations.

### Modified Capabilities
- None

## Impact

- Backend: Modifications to the auth middleware and login controllers.
- Frontend: Update to the authentication service and frontend UI components.
- Configuration: New environment variables to toggle between JWT and non-JWT modes.