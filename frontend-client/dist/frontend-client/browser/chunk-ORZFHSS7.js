import {
  ThemeToggle
} from "./chunk-YM2DTTVC.js";
import {
  Component,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵtext
} from "./chunk-PRHJK7ED.js";

// src/app/views/qr-landing/qr-landing.ts
var QrLandingView = class _QrLandingView {
  static \u0275fac = function QrLandingView_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _QrLandingView)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _QrLandingView, selectors: [["app-qr-landing"]], decls: 7, vars: 0, template: function QrLandingView_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "app-theme-toggle");
      \u0275\u0275elementStart(1, "h1");
      \u0275\u0275text(2, "\u{1F4F1}");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(3, "h2");
      \u0275\u0275text(4, "SmartComanda");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "p");
      \u0275\u0275text(6, "Escane\xE1 el c\xF3digo QR del local para armar tu pedido.");
      \u0275\u0275elementEnd();
    }
  }, dependencies: [ThemeToggle], styles: ["\n[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  padding: 24px;\n  text-align: center;\n  gap: 8px;\n}\nh1[_ngcontent-%COMP%] {\n  font-size: 48px;\n  margin: 0;\n}\nh2[_ngcontent-%COMP%] {\n  margin: 0;\n}\np[_ngcontent-%COMP%] {\n  color: var(--muted);\n  margin: 0;\n}\n/*# sourceMappingURL=qr-landing.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(QrLandingView, [{
    type: Component,
    args: [{ selector: "app-qr-landing", imports: [ThemeToggle], template: "<app-theme-toggle />\n<h1>\u{1F4F1}</h1>\n<h2>SmartComanda</h2>\n<p>Escane\xE1 el c\xF3digo QR del local para armar tu pedido.</p>", styles: ["/* src/app/views/qr-landing/qr-landing.scss */\n:host {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  padding: 24px;\n  text-align: center;\n  gap: 8px;\n}\nh1 {\n  font-size: 48px;\n  margin: 0;\n}\nh2 {\n  margin: 0;\n}\np {\n  color: var(--muted);\n  margin: 0;\n}\n/*# sourceMappingURL=qr-landing.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(QrLandingView, { className: "QrLandingView", filePath: "src/app/views/qr-landing/qr-landing.ts", lineNumber: 11 });
})();
export {
  QrLandingView
};
//# sourceMappingURL=chunk-ORZFHSS7.js.map
