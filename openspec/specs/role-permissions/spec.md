# role-permissions Specification

## Purpose
Define los roles del sistema, su nombre visible y qué puede hacer cada uno en la API, el POS y el panel admin, para que cada persona del local opere solo según su función.

## Requirements

### Requirement: System roles
The system SHALL provide the roles `sysadmin` (Sistema), `owner` (Propietario), `admin` (displayed as Encargado), `cashier` (Cajero), and `cook` (Cocinero). Every user interface SHALL display the Spanish name of the role, never its code.

#### Scenario: Admin shown as Encargado
- **WHEN** a user with role `admin` is listed in the admin panel or shown in the POS
- **THEN** the role is displayed as "Encargado"

#### Scenario: Cook role available
- **WHEN** an `owner` creates a user for their tenant
- **THEN** "Cocinero" is offered as a role

### Requirement: Permission matrix
The system SHALL authorize each action by role as follows, and SHALL reject any other combination with HTTP 403 without changing data:

| Action | sysadmin | owner | admin | cashier | cook |
|---|---|---|---|---|---|
| Open / close cash session | ✓ | ✓ | ✓ | ✓ | — |
| Create order | ✓ | ✓ | ✓ | ✓ | — |
| Charge order (incl. pending QR) | ✓ | ✓ | ✓ | ✓ | — |
| Advance kitchen status (new → preparing → ready → delivered) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cancel order | ✓ | ✓ | ✓ | — | — |
| Correct order items | ✓ | ✓ | ✓ | — | — |
| View branch orders | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✓ | ✓ | ✓ (limited) | — | — |

Non-`sysadmin` users SHALL only act on data of their own tenant.

#### Scenario: Cook cannot create orders
- **WHEN** a `cook` attempts to create or charge an order
- **THEN** the API responds with HTTP 403 and no order is created or charged

#### Scenario: Cashier cannot cancel
- **WHEN** a `cashier` attempts to cancel an order
- **THEN** the API responds with HTTP 403 and the order keeps its status

#### Scenario: Cook advances kitchen status
- **WHEN** a `cook` moves an order of their branch from `new` to `preparing`
- **THEN** the change is applied

### Requirement: Application access by role
The admin panel SHALL allow sign-in only to `sysadmin`, `owner`, and `admin` users; `cashier` and `cook` users SHALL be told to use the POS. The POS SHALL allow all roles, SHALL show a `cook` only the kitchen screen, and SHALL show `cashier`, `admin`, `owner`, and `sysadmin` the orders, kitchen, and cash screens.

#### Scenario: Cashier signs in to the admin panel
- **WHEN** a `cashier` signs in to the admin panel
- **THEN** access is denied with a message to use the POS and no session is kept

#### Scenario: Cook signs in to the POS
- **WHEN** a `cook` signs in to the POS and selects a branch
- **THEN** the POS opens the kitchen screen and does not offer the orders or cash screens
