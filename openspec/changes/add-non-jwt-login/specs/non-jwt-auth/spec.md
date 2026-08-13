## Purpose

Provides a simplified login mechanism that does not rely on JWTed tokens, enabling easier local development and internal access.

## ADDED Requirements

### Requirement: non-jwt authentication flow
The system SHALL support an authentication flow that relies on session cookies or simple tokens instead of JSON Web Tokens (JWT).

#### Scenario: Successful non-jwt login
- **WHEN** a user submits credentials via the non-jwt endpoint
- **THEN** the system issues a valid session for the user.
