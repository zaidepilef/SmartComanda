# branch-detail-screen Specification

## Purpose

Provides a dedicated per-branch screen in the admin UI where authorized roles can view and edit a branch's configuration, structured with tabs to host future management sections such as menu, tables, schedules, and settings.

## Requirements

### Requirement: Branch detail screen
The system SHALL provide a detail screen at `/branches/:id`, accessible only to users with the `sysadmin`, `admin`, or `owner` roles, showing the branch data and an edit form for `name`, `type`, `address`, `city`, `phone`, and `active`. Saving the form SHALL update the branch through `PUT /api/branches/:id`, respecting the tenant scoping rules of that endpoint.

#### Scenario: Opening the detail of an existing branch
- **WHEN** an authenticated `sysadmin`, `admin`, or `owner` navigates to `/branches/:id` for an existing branch it is allowed to access
- **THEN** the screen displays the branch data and the edit form, and allows saving changes.

#### Scenario: Opening the detail of a branch of another tenant
- **WHEN** an authenticated `admin` or `owner` navigates to `/branches/:id` for a branch that belongs to another tenant
- **THEN** the screen shows an error state and does not display branch data.

#### Scenario: Opening the detail of a nonexistent branch
- **WHEN** a user navigates to `/branches/:id` with a non-existent branch id
- **THEN** the screen shows an error state and does not display branch data.

#### Scenario: Saving changes from the detail screen
- **WHEN** the user edits the branch fields in the detail screen and saves
- **THEN** the branch is updated and the screen reflects the saved values.

#### Scenario: Non-manager roles are blocked
- **WHEN** a user whose role is not `sysadmin`, `admin`, or `owner` navigates to `/branches/:id`
- **THEN** the application redirects the user away from the detail screen.

### Requirement: Branch detail sections
The branch detail screen SHALL display a tabbed structure containing the branch edit form plus placeholder sections reserved for future management features (menu, tables, schedules, settings). Placeholder sections SHALL render as empty states without exposing unimplemented functionality.

#### Scenario: Tab bar renders the available sections
- **WHEN** the detail screen loads
- **THEN** a tab bar shows the edit section and the placeholder sections (menu, tables, schedules, settings).

#### Scenario: Navigating between sections
- **WHEN** the user clicks a placeholder tab
- **THEN** the screen displays an empty state indicating the section is not available yet, without errors.

#### Scenario: Returning to the branch list
- **WHEN** the user clicks the back action on the detail screen
- **THEN** the application navigates back to the branch list.
