## ADDED Requirements

### Requirement: Delivery location columns
A versioned migration SHALL add to `branches` the nullable columns `lat`, `lng` (`NUMERIC(9,6)`), `delivery_max_km`, `delivery_max_minutes`, and `delivery_avg_speed_kmh` (default 25). A versioned migration SHALL add to `orders` the nullable columns `delivery_address`, `delivery_reference`, `delivery_lat`, `delivery_lng`, `delivery_accuracy_m`, `delivery_distance_km`, `delivery_eta_minutes`, and `delivery_out_of_range`, and an index on `(foodtruck_id, order_type, created_at)`.

#### Scenario: Existing rows stay valid
- **WHEN** the migrations run on a database with existing branches and orders
- **THEN** existing rows keep their data with the new columns null, and branches get `delivery_avg_speed_kmh` 25
