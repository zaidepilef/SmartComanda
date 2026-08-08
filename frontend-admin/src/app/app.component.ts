import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'SmartComanda Admin';

  readonly #titleService = inject(Title);
  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);

  constructor() {
    this.#titleService.setTitle(this.title);
    // iconSet singleton
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('smartcomanda-admin-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }
}
