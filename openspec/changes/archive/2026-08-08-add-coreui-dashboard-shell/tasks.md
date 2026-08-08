## 1. Dependencies and project config

- [x] 1.1 Add CoreUI packages to `frontend-admin/package.json` pinned to the Angular 21 compatible line (`@coreui/angular@~5.6.25`, `@coreui/coreui@^5.4.3`, `@coreui/icons@^3.1.0`, `@coreui/icons-angular@~5.6.25`, `@coreui/angular-chartjs@~5.6.25`, `@angular/cdk@^21.2`, `chart.js@^4.5.1`, `ngx-scrollbar`)
- [x] 1.2 Install dependencies (npm install in the dev container or host)
- [x] 1.3 Update `angular.json`: remove SSR (`server`, `ssr`, `outputMode`, `main.server.ts` references), add CoreUI theme SCSS to `styles`, keep `security.allowedHosts`
- [x] 1.4 Remove SSR entry files (`main.server.ts`, `server.ts`, `app.config.server.ts`, `app.routes.server.ts`) and drop `@angular/ssr` usage
- [x] 1.5 Update `package.json` scripts (remove SSR serve script)

## 2. CoreUI theme and icons

- [x] 2.1 Create `src/scss/` with CoreUI theme imports and update `src/styles.scss`
- [x] 2.2 Create `src/app/icons/` icon subset (CoreUI icons used by the shell)
- [x] 2.3 Update `src/index.html` with title/branding base

## 3. Dashboard shell

- [x] 3.1 Create `src/app/layout/default-layout/` with `_nav.ts` navigation config (Dashboard, Tables, Typography, Icons)
- [x] 3.2 Create shell components: `default-layout`, `default-header`, `default-footer`
- [x] 3.3 Update `app.routes.ts` with shell route (default path to Dashboard) and demo view child routes
- [x] 3.4 Replace scaffold `app.html`/`app.scss` with the shell host and remove placeholder content

## 4. Views

- [x] 4.1 Create Dashboard view with stat cards (orders, revenue, pending, average ticket) and placeholder chart area
- [x] 4.2 Create demo views: Tables, Typography, Icons (static content)
- [x] 4.3 Wire demo views into `_nav.ts` and routes

## 5. Build and Docker

- [x] 5.1 Update `frontend-admin/Dockerfile` nginx stage to copy `dist/frontend-admin/browser/` to the web root
- [x] 5.2 Verify host build: `npm run build` succeeds and outputs a static browser bundle
- [x] 5.3 Rebuild dev container (`docker compose up --build`) and verify the shell renders at `:4200` with navigation working
- [x] 5.4 Run `openspec validate --change add-coreui-dashboard-shell`
