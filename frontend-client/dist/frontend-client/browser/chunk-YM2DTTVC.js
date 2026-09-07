import {
  Component,
  ThemeService,
  computed,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵtext,
  ɵɵtextInterpolate1
} from "./chunk-PRHJK7ED.js";

// src/app/components/theme-toggle/theme-toggle.ts
var ThemeToggle = class _ThemeToggle {
  themeService = inject(ThemeService);
  resolved = this.themeService.resolved;
  icon = computed(() => this.resolved() === "dark" ? "\u2600\uFE0F" : "\u{1F319}", ...ngDevMode ? [{ debugName: "icon" }] : (
    /* istanbul ignore next */
    []
  ));
  label = computed(() => this.resolved() === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro", ...ngDevMode ? [{ debugName: "label" }] : (
    /* istanbul ignore next */
    []
  ));
  toggle() {
    this.themeService.cycle();
  }
  static \u0275fac = function ThemeToggle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ThemeToggle)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ThemeToggle, selectors: [["app-theme-toggle"]], decls: 2, vars: 3, consts: [["type", "button", 1, "theme-toggle", 3, "click", "title"]], template: function ThemeToggle_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "button", 0);
      \u0275\u0275domListener("click", function ThemeToggle_Template_button_click_0_listener() {
        return ctx.toggle();
      });
      \u0275\u0275text(1);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275domProperty("title", ctx.label());
      \u0275\u0275attribute("aria-label", ctx.label());
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.icon(), "\n");
    }
  }, styles: ["\n[_nghost-%COMP%] {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  z-index: 60;\n}\n.theme-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 42px;\n  height: 42px;\n  padding: 0;\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  background: var(--surface);\n  box-shadow: var(--shadow);\n  font-size: 20px;\n  line-height: 1;\n  cursor: pointer;\n}\n.theme-toggle[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 2px;\n}\n/*# sourceMappingURL=theme-toggle.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ThemeToggle, [{
    type: Component,
    args: [{ selector: "app-theme-toggle", imports: [], template: '<button\n  class="theme-toggle"\n  type="button"\n  (click)="toggle()"\n  [attr.aria-label]="label()"\n  [title]="label()"\n>\n  {{ icon() }}\n</button>', styles: ["/* src/app/components/theme-toggle/theme-toggle.scss */\n:host {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  z-index: 60;\n}\n.theme-toggle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 42px;\n  height: 42px;\n  padding: 0;\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  background: var(--surface);\n  box-shadow: var(--shadow);\n  font-size: 20px;\n  line-height: 1;\n  cursor: pointer;\n}\n.theme-toggle:focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 2px;\n}\n/*# sourceMappingURL=theme-toggle.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ThemeToggle, { className: "ThemeToggle", filePath: "src/app/components/theme-toggle/theme-toggle.ts", lineNumber: 11 });
})();

export {
  ThemeToggle
};
//# sourceMappingURL=chunk-YM2DTTVC.js.map
