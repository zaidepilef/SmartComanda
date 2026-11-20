## MODIFIED Requirements

### Requirement: Public menu listing
The system SHALL provide a public endpoint `GET /api/public/menu` that takes `tenantId` and `branchId`, validates that the branch exists, belongs to the tenant, and is `active`, and SHALL return the tenant's business name, the branch name, and the list of `active` dishes (id, name, description, icon, category) with the effective sale price for that branch.

The client SHALL present that menu with dishes grouped by category, each showing icon, name, description, and sale price, with search and category filter. The menu SHALL render in the active theme (light or dark) of the client, using the theme tokens so that backgrounds, surfaces, text, prices, and interactive elements remain legible and consistent in both themes. The sale price SHALL use the theme's high-contrast tone.

#### Scenario: Listing the menu of an active branch
- **WHEN** a customer requests the menu of an active branch that belongs to the tenant
- **THEN** the response contains the business name, branch name, and the tenant's active dishes with their branch-effective prices

#### Scenario: Branch price override takes precedence
- **WHEN** the branch has a `branchPrices` override for a dish
- **THEN** the menu shows the override price instead of the dish's default `salePrice`

#### Scenario: Excluding inactive dishes
- **WHEN** a dish is marked inactive
- **THEN** the dish does not appear in the public menu

#### Scenario: Rejecting an unknown or inactive branch
- **WHEN** the branch does not exist, belongs to another tenant, or is inactive
- **THEN** the endpoint rejects the request with an error and exposes no menu data

#### Scenario: Rendering the menu in light theme
- **WHEN** the public menu renders in the light theme
- **THEN** the background is light warm orange, dish cards use the surface tone, text is dark warm brown, and prices use the darkest orange tone

#### Scenario: Rendering the menu in dark theme
- **WHEN** the public menu renders in the dark theme
- **THEN** the background is very dark warm orange, dish cards use a slightly lighter surface tone, text is light warm cream, and prices use the most luminous orange tone

#### Scenario: Search and category controls match the theme
- **WHEN** the search input and category buttons render in either theme
- **THEN** they use the theme's surface, border, and text tones so they remain legible
