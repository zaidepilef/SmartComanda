import { Component, inject } from '@angular/core';

import { LanUrlService } from '../../services/lan-url.service';

@Component({
  selector: 'app-lan-url-toggle',
  templateUrl: './lan-url-toggle.component.html'
})
export class LanUrlToggleComponent {
  readonly #lanUrl = inject(LanUrlService);

  readonly enabled = this.#lanUrl.enabled;
  readonly ip = this.#lanUrl.ip;
  readonly detectedIp = this.#lanUrl.detectedIp;
  readonly port = this.#lanUrl.port;
  readonly baseUrl = this.#lanUrl.baseUrl;

  toggle(event: Event): void {
    this.#lanUrl.setEnabled((event.target as HTMLInputElement).checked);
  }

  onIpInput(event: Event): void {
    this.#lanUrl.setIp((event.target as HTMLInputElement).value);
  }
}