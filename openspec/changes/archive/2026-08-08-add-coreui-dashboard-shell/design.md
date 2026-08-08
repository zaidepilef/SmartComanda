## Context

`frontend-admin` is a bare Angular 21.2 scaffold (SSR enabled, no routes, no UI library). See proposal.md - Why. The CoreUI free Angular template's `v5.6` branch and the `@coreui/angular@~5.6` package line are the ones compatible with Angular 21 (the `main`/5.7 line requires Angular 22).

## Goals / Non-Goals

**Goals:**
- Ship a working shell (sidebar + header + footer + routed content) styled with CoreUI/Bootstrap 5.
- Use CoreUI Angular components directly (`@coreui/angular`), not hand-rolled copies.
- Keep the dependency footprint minimal: only the packages the shell actually uses.
- Production build produces a static client bundle served by nginx.

**Non-Goals:**
- No authentication, API integration, or business logic.
- No chart data wiring - dashboard widgets and chart are static placeholders.
- No adoption of the template's full demo view set (accordions, carousels, forms, etc.).

## Decisions

1. **Use CoreUI 5.6.x package line (not latest).**
   `@coreui/angular@~5.6` declares peer deps on Angular `^21`; `@coreui/angular@5.7.x` requires Angular `^22`. Rationale: version compatibility with the existing project. Alternatives: upgrading the whole app to Angular 22 (out of scope, risky).

2. **Port the shell pattern, not the template repo.**
   We copy the *structure* of CoreUI's `default-layout` (components: sidebar, header, footer; `_nav` config; icons subset) into our own `src/app/layout/` and `src/app/views/`, adapted to SmartComanda names and routes. The CoreUI packages are installed from npm. Alternatives: wholesale `git clone` of the template (brings demo dead weight, per AGENTS.md KISS/DRY); referencing only (slower to build a consistent shell).

3. **Drop SSR, switch to client-side rendering.**
   The admin panel is behind a future login; it gains nothing from SSR, and CoreUI components assume a browser environment. Remove `server`/`ssr`/`outputMode` from `angular.json`, delete SSR entry files, and add SSR-related deps removal (`@angular/ssr`). Alternatives: keep SSR and guard browser APIs (extra complexity, no benefit).

4. **Fix the production nginx stage.**
   The Dockerfile's nginx stage copies `/app/dist` wholesale, but with the browser build the `index.html` lives at `dist/frontend-admin/browser/` - the root then shows nginx's default page. Change the COPY to target the `browser` output. Alternatives: keep `outputMode: "server"` (inconsistent with decision 3).

5. **Structure the app for growth.**
   - `src/app/layout/default-layout/` - shell components + `_nav.ts`
   - `src/app/views/dashboard/` - dashboard view
   - `src/app/views/` - demo views (`tables`, `typography`, `icons`)
   - `src/app/icons/` - icon subset
   - `src/scss/` - CoreUI theme imports; `src/styles.scss` includes it
   Routes: dashboard default, demo views nested under the layout via a shell route with child routes.

## Risks / Trade-offs

- [CoreUI peer dependency mismatch if someone bumps `@coreui/angular` to latest] → Pin `~5.6.25` in `package.json`; document in README that upgrades must stay on the 5.6 line while the app is Angular 21.
- [Removing SSR deletes `server.ts`/`main.server.ts` and the SSR scripts] → Confirmed no backend relies on SSR; `npm run build` output changes shape, verified locally and in Docker.
- [Docker `node_modules` volume masks new packages] → The dev container mounts `smartcomanda_frontend_node_modules`; after changing `package.json`, rebuild the image/volume (`docker compose up --build`) so CoreUI deps install.
- [CoreUI side/header behavior under hot-reload] → Mitigated by using CoreUI's own components (`c-sidebar`, `c-header`, etc.) which are HMR-friendly.
- [Bootstrap/global styles leaking into app styles] → CoreUI theme imported once in `styles.scss`; component styles stay scoped.

## Migration Plan

1. Install CoreUI packages via npm (host or inside the dev container).
2. Restructure `src/app` (layout, views, icons) and replace scaffold `app.html`/`app.scss`.
3. Update `angular.json` (remove SSR, add style/script assets), delete SSR files, update scripts.
4. Update `Dockerfile` nginx stage to serve `dist/frontend-admin/browser`.
5. Verify: `npm run build` (host) and `docker compose up --build` → shell renders at `:4200`.
   Rollback: revert `frontend-admin` changes via git; previous app was scaffold-only.

## Open Questions

- Exact sidebar labels/branding (SmartComanda name/logo) can be decided during implementation without affecting the spec.
