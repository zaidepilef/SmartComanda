## Purpose

Provides the frontend-client's light and dark visual themes: a monochromatic orange palette where the most important elements use the tone of maximum contrast against the background, a manual light/dark toggle with system preference as default, and persistence across reloads.

## ADDED Requirements

### Requirement: Theme-aware rendering
The frontend-client SHALL render in a light or dark theme, both derived from a single orange hue scale. In the light theme, the background, surfaces, and text use the light-to-dark tones of that hue, and the most important elements (primary action, prices, order number) use the darkest tones. In the dark theme, the background and surfaces use the darkest warm tones, and the most important elements use the most luminous tones of the hue so they keep maximum contrast against the dark background.

#### Scenario: Rendering in light theme
- **WHEN** the light theme is active
- **THEN** the background is a light warm orange, surfaces are near-white, text is dark warm brown, and the primary action uses the darkest orange tone with light text

#### Scenario: Rendering in dark theme
- **WHEN** the dark theme is active
- **THEN** the background is a very dark warm orange, surfaces are one tone lighter, text is light warm cream, and the primary action uses the most luminous orange tone

#### Scenario: The order number and prices stand out
- **WHEN** the menu, cart, or success screen shows a price or the order number
- **THEN** those values use the theme's high-contrast tone (darkest in light, most luminous in dark) so they are the most prominent elements

### Requirement: Theme toggle with system preference
The frontend-client SHALL let the user switch between light, dark, and system-preferred themes via a visible control. The initial default SHALL follow the device's `prefers-color-scheme`. Once the user chooses a theme explicitly, that choice SHALL persist across reloads and SHALL override the system preference until the user changes it or returns to the system option. When the system option is active and the device changes its color scheme, the client SHALL follow that change.

#### Scenario: Following the system preference by default
- **WHEN** a user opens the client with no saved choice and the device prefers dark
- **THEN** the client renders in dark theme

#### Scenario: Manual override persists
- **WHEN** a user switches the theme to dark and reloads the page
- **THEN** the client renders in dark theme without further interaction

#### Scenario: Returning to the system option
- **WHEN** a user selects the system option after a manual choice
- **THEN** the client renders according to the device's `prefers-color-scheme`

#### Scenario: Following a system change in real time
- **WHEN** the system option is active and the device switches its color scheme
- **THEN** the client switches theme without a reload

### Requirement: No flash of the wrong theme
The client SHALL determine the initial theme before the first paint, so a dark-mode user never sees a flash of the light theme while the page loads.

#### Scenario: Dark-mode user loads the page
- **WHEN** a user with a saved or system dark preference loads the client
- **THEN** the first painted frame is already in dark theme

### Requirement: Theme-consistent component colors
All colored components in the order flow SHALL use theme tokens: field errors, the points badge, the global error banner, and the overlay SHALL have light and dark variants derived from the orange palette, and SHALL NOT use fixed colors that break contrast in either theme.

#### Scenario: Error colors in dark theme
- **WHEN** the dark theme is active and a field or global error is shown
- **THEN** the error is visible with adequate contrast against the dark background

#### Scenario: Points badge in both themes
- **WHEN** the points badge is shown in light and dark themes
- **THEN** it uses a warm amber variant legible in each theme