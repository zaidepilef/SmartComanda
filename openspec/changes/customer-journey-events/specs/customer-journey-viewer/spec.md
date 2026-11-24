## Purpose

Da al administrador del local una vista en el panel para seguir a los clientes del flujo QR: en qué etapa está cada sesión, qué pasó paso a paso y cuántos clientes llegan a pedir.

## ADDED Requirements

### Requirement: Journey sessions list
The admin panel SHALL provide a "Eventos de clientes" screen, available to `admin` and `owner` users, that lists the journey sessions of a selected branch and date range, showing for each session its start time, last activity, the customer name and phone when identified, the current stage, and the order number when created. The list SHALL refresh periodically while the screen is open.

#### Scenario: Viewing sessions of a branch
- **WHEN** an `admin` or `owner` opens the screen and selects one of their branches and a date range
- **THEN** the panel lists that branch's sessions in the range, most recent first

#### Scenario: Live activity appears without reloading
- **WHEN** a customer advances in the flow while the screen is open
- **THEN** the session's stage and last activity update on the next refresh without reloading the page

#### Scenario: Other tenants are not visible
- **WHEN** a user requests sessions for a branch of another tenant
- **THEN** the request is rejected

### Requirement: Session stage
The system SHALL derive each session's current stage from its events, in this order of precedence: `pedido creado` (has `order_created`), `pedido fallido` (last order attempt failed), `envió pedido` (has `order_submitted` without outcome), `con carrito` (cart has items), `identificado` (has `identity_submitted`), `abrió QR`. A session without activity for 30 minutes and without a created order SHALL be shown as `abandonó` along with the last stage reached.

#### Scenario: Customer stuck after a failed order
- **WHEN** a session's last order attempt has an `order_failed` event
- **THEN** the session is shown as `pedido fallido` with the failure reason

#### Scenario: Customer abandons with items in the cart
- **WHEN** a session has items in the cart and no activity for 30 minutes
- **THEN** the session is shown as `abandonó` with last stage `con carrito`

### Requirement: Session timeline
The admin panel SHALL show, for a selected session, the chronological list of its events with time, event type in Spanish, and the event details (dishes, totals, order number, failure reason).

#### Scenario: Inspecting a failed session
- **WHEN** the user opens a session that ended in `pedido fallido`
- **THEN** the timeline shows every step up to the failure, including the HTTP status and reason of the failed attempt

### Requirement: Conversion funnel
The admin panel SHALL show, for the selected branch and date range, the number of sessions that reached each step — abrió QR, identificado, con carrito, envió pedido, pedido creado — and the number of failed order attempts.

#### Scenario: Funnel for a day
- **WHEN** the user selects a branch and a single day
- **THEN** the funnel shows the session count for each step of that day and the failed attempts
