## ADDED Requirements

### Requirement: Branch geolocation
The system SHALL let `sysadmin`, `owner`, and `admin` users store a branch's exact location as `lat` (−90 to 90) and `lng` (−180 to 180) through branch create and update. Both values SHALL be sent together or not at all. The admin panel SHALL let the user enter the location as coordinates, by pasting a Google Maps URL containing coordinates, or by placing a marker on a map.

#### Scenario: Saving coordinates
- **WHEN** a manager updates a branch with `lat` -33.4372 and `lng` -70.6506
- **THEN** the branch stores and returns those coordinates

#### Scenario: Only one coordinate is rejected
- **WHEN** a request sends `lat` without `lng`
- **THEN** the API rejects it with a validation error

#### Scenario: Pasting a Google Maps link
- **WHEN** a manager pastes a full Google Maps URL that contains `@-33.4372,-70.6506`
- **THEN** the admin fills the coordinates and moves the map marker to that point

#### Scenario: Short Google Maps link
- **WHEN** a manager pastes a `maps.app.goo.gl` link
- **THEN** the admin explains that the full URL is needed and does not request the link from the server

### Requirement: Branch delivery limits
Each branch SHALL store optional delivery limits `deliveryMaxKm` (greater than 0), `deliveryMaxMinutes` (greater than 0), and `deliveryAvgSpeedKmh` (5 to 120, default 25), editable from the admin panel together with the location.

#### Scenario: Default average speed
- **WHEN** a branch is created without `deliveryAvgSpeedKmh`
- **THEN** the branch returns `deliveryAvgSpeedKmh` 25

#### Scenario: Clearing a limit
- **WHEN** a manager updates a branch with `deliveryMaxKm` null
- **THEN** the branch has no distance limit
