## Why

The admin frontend (`frontend-admin`) is still the default Angular scaffold with no navigation, no layout, and no dashboard. SmartComanda needs a professional admin panel for restaurant staff to manage orders, products, and operations. Instead of building a UI kit from scratch, we adopt the CoreUI Angular template (version 5.6 line, compatible with Angular 21) to provide a battle-tested sidebar/header/footer shell and Bootstrap 5 theme.

## What Changes

- Install CoreUI packages compatible with Angular 21 (`@coreui/angular@~5.6`, `@coreui/coreui`, `@coreui/icons`, `@coreui/icons-angular`, `@coreui/angular-chartjs`, `@angular/cdk`, `chart.js`, `ngx-scrollbar`).
- Build a minimal dashboard shell: sidebar navigation, header with user/notifications, footer, and routed content area (pattern from CoreUI `default-layout`).
- Create a Dashboard view with design-only stat widgets and placeholder charts.
- Add a few demo views (Tables, Typography, Icons) to showcase the shell navigation.
- Remove Angular SSR for the admin panel and switch the build to client-side rendering (**BREAKING**: `angular.json` drops `server`/`ssr`/`outputMode`, `main.server.ts`/`server.ts`/SSR config removed).
- Fix the production Dockerfile nginx stage so it serves the built `browser` bundle (`dist/frontend-admin/browser/`) instead of the whole `dist` directory.
- Replace the scaffolded welcome page and default styles with the CoreUI theme.
- No business logic, API calls, or authentication in this change - design/UI only.

## Capabilities

### New Capabilities
- `admin-dashboard-shell`: The admin panel shell (sidebar + header + footer layout with routed content) and a design-only dashboard view.

### Modified Capabilities
<!-- none -->

## Impact

- **frontend-admin**: `package.json` (new deps), `angular.json` (remove SSR, add styles), `src/` restructure (layout, views, icons, theme SCSS), deletion of SSR entry files.
- **Docker**: `frontend-admin/Dockerfile` nginx stage serves the correct `browser` output path; dev stage unchanged.
- **Dependencies**: adds CoreUI 5.6.x, Bootstrap 5 (via `@coreui/coreui`), Chart.js, Angular CDK; removes SSR runtime deps usage (`@angular/ssr`).
- No backend or database changes.
