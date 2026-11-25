# delivery-analytics Specification

## Purpose
Da a los encargados del local un informe y un mapa de los pedidos a domicilio de un período (distancias, tiempos estimados y pedidos fuera de cobertura) para analizar la zona de reparto de cada sucursal.

## Requirements

### Requirement: Delivery analytics report
The system SHALL provide `GET /api/orders/delivery-analytics` with `branchId`, `from`, and `to` filters, available to `sysadmin`, `owner`, and `admin` users of the tenant, that returns the delivery orders of the period with number, date, address, coordinates, distance, minutes, and out-of-range flag, plus totals: order count, orders with estimate, average distance, average minutes, out-of-range percentage, and counts per distance bucket (0–2, 2–5, 5–10, more than 10 km).

#### Scenario: Report totals
- **WHEN** a manager requests the report for a branch and period with delivery orders
- **THEN** the response contains the orders and the totals for that period

#### Scenario: Cashier cannot see the report
- **WHEN** a `cashier` requests the report
- **THEN** the API responds with HTTP 403

### Requirement: Delivery analytics screen
The admin panel SHALL provide an "Análisis delivery" screen with branch and date filters, the report totals, the order table, and a map showing the branch, each customer point colored by in range or out of range, and a circle for `deliveryMaxKm` when defined.

#### Scenario: Viewing the coverage map
- **WHEN** a manager opens the screen for a branch with coordinates and delivery orders
- **THEN** the map shows the branch, the customer points, and the distance limit circle
