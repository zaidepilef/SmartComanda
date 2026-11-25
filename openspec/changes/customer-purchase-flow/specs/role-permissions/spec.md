## MODIFIED Requirements

### Requirement: System roles
The system SHALL provide the roles `sysadmin` (Sistema), `owner` (Propietario), `admin` (displayed as Encargado), `cashier` (Cajero), `cook` (Cocinero), and `driver` (Repartidor). Every user interface SHALL display the Spanish name of the role, never its code. `owner` and `admin` SHALL be able to create `driver` users for their tenant.

#### Scenario: Admin shown as Encargado
- **WHEN** a user with role `admin` is listed in the admin panel or shown in the POS
- **THEN** the role is displayed as "Encargado"

#### Scenario: Cook role available
- **WHEN** an `owner` creates a user for their tenant
- **THEN** "Cocinero" is offered as a role

#### Scenario: Driver role available
- **WHEN** an `admin` creates a user for their tenant
- **THEN** "Repartidor" is offered as a role

### Requirement: Permission matrix
The system SHALL authorize each action by role as follows, and SHALL reject any other combination with HTTP 403 without changing data:

| Action | sysadmin | owner | admin | cashier | cook | driver |
|---|---|---|---|---|---|---|
| Open / close cash session | ✓ | ✓ | ✓ | ✓ | — | — |
| Create order | ✓ | ✓ | ✓ | ✓ | — | — |
| Charge order at the register (incl. pending QR) | ✓ | ✓ | ✓ | ✓ | — | — |
| Advance kitchen status (new → preparing → ready → delivered) | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Take a delivery order out (ready → out_for_delivery) | ✓ | ✓ | ✓ | — | — | ✓ |
| Assign or reassign a driver | ✓ | ✓ | ✓ | — | — | — |
| Collect payment and deliver (out_for_delivery → delivered) | ✓ | ✓ | ✓ | — | — | ✓ (own) |
| Record a rejected payment on delivery | ✓ | ✓ | ✓ | — | — | ✓ (own) |
| Cancel order | ✓ | ✓ | ✓ | — | — | — |
| Correct order items | ✓ | ✓ | ✓ | — | — | — |
| View branch orders | ✓ | ✓ | ✓ | ✓ | ✓ | delivery only |
| Manage users | ✓ | ✓ | ✓ (limited) | — | — | — |

Non-`sysadmin` users SHALL only act on data of their own tenant; `cashier`, `cook`, and `driver` only on their own branch.

#### Scenario: Cook cannot create orders
- **WHEN** a `cook` attempts to create or charge an order
- **THEN** the API responds with HTTP 403 and no order is created or charged

#### Scenario: Cashier cannot cancel
- **WHEN** a `cashier` attempts to cancel an order
- **THEN** the API responds with HTTP 403 and the order keeps its status

#### Scenario: Cook advances kitchen status
- **WHEN** a `cook` moves an order of their branch from `new` to `preparing`
- **THEN** the change is applied

#### Scenario: Driver cannot charge at the register
- **WHEN** a `driver` attempts to charge a pending QR order or open a cash session
- **THEN** the API responds with HTTP 403

#### Scenario: Driver sees only delivery orders
- **WHEN** a `driver` lists orders of their branch
- **THEN** only app delivery orders are returned

### Requirement: Application access by role
The admin panel SHALL allow sign-in only to `sysadmin`, `owner`, and `admin` users; `cashier`, `cook`, and `driver` users SHALL be told to use the POS. The POS SHALL allow all roles, SHALL show a `cook` only the kitchen screen, SHALL show a `driver` only the dispatch screen, and SHALL show `cashier`, `admin`, `owner`, and `sysadmin` the orders, kitchen, dispatch, and cash screens.

#### Scenario: Cashier signs in to the admin panel
- **WHEN** a `cashier` signs in to the admin panel
- **THEN** access is denied with a message to use the POS and no session is kept

#### Scenario: Cook signs in to the POS
- **WHEN** a `cook` signs in to the POS and selects a branch
- **THEN** the POS opens the kitchen screen and does not offer the orders or cash screens

#### Scenario: Driver signs in to the POS
- **WHEN** a `driver` signs in to the POS and selects a branch
- **THEN** the POS opens the dispatch screen and does not offer the orders, kitchen, or cash screens
