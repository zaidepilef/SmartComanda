## MODIFIED Requirements

### Requirement: Public menu listing
The system SHALL present the tenant's public menu with dishes grouped by category, each showing icon, name, description, and sale price, with search and category filter. The menu SHALL render in the active theme (light or dark) of the client, using the theme tokens so that backgrounds, surfaces, text, prices, and interactive elements remain legible and consistent in both themes. The sale price SHALL use the theme's high-contrast tone.

#### Scenario: Rendering the menu in light theme
- **WHEN** the public menu renders in the light theme
- **THEN** the background is light warm orange, dish cards use the surface tone, text is dark warm brown, and prices use the darkest orange tone

#### Scenario: Rendering the menu in dark theme
- **WHEN** the public menu renders in the dark theme
- **THEN** the background is very dark warm orange, dish cards use a slightly lighter surface tone, text is light warm cream, and prices use the most luminous orange tone

#### Scenario: Search and category controls match the theme
- **WHEN** the search input and category buttons render in either theme
- **THEN** they use the theme's surface, border, and text tones so they remain legible