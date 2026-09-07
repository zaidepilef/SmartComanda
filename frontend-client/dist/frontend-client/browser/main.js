import {
  RouterOutlet,
  bootstrapApplication,
  provideHttpClient,
  provideRouter
} from "./chunk-IMUMC2UJ.js";
import {
  Component,
  ThemeService,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement
} from "./chunk-PRHJK7ED.js";

// src/app/app.routes.ts
var routes = [
  {
    path: "q",
    loadComponent: () => import("./chunk-ORZFHSS7.js").then((m) => m.QrLandingView)
  },
  {
    path: "q/:tenantId/:branchId",
    loadComponent: () => import("./chunk-BE2VYRLK.js").then((m) => m.OrderFlowView)
  },
  { path: "", pathMatch: "full", redirectTo: "q" },
  { path: "**", redirectTo: "q" }
];

// src/app/app.config.ts
var appConfig = {
  providers: [provideRouter(routes), provideHttpClient(), ThemeService]
};

// src/app/app.ts
var App = class _App {
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 1, vars: 0, template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=app.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(App, [{
    type: Component,
    args: [{ selector: "app-root", imports: [RouterOutlet], template: "<router-outlet />", styles: ["/* src/app/app.scss */\n:host {\n  display: block;\n}\n/*# sourceMappingURL=app.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 10 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
