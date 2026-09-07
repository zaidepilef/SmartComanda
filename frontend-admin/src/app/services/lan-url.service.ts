import { Injectable, computed, signal } from '@angular/core';

import { environment } from '../../environments/environment';

const STORAGE_KEY = 'sc-lan-ip';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1'];

@Injectable({ providedIn: 'root' })
export class LanUrlService {
  readonly enabled = signal(false);

  readonly ip = signal<string>(localStorage.getItem(STORAGE_KEY) ?? '');

  readonly detectedIp = computed<string>(() => {
    if (environment.production) {
      return '';
    }

    const host = window.location.hostname;

    if (!host || LOCAL_HOSTNAMES.includes(host)) {
      return '';
    }

    return host;
  });

  readonly port = computed<string>(() => {
    try {
      return new URL(environment.publicUrl).port;
    } catch {
      return '';
    }
  });

  readonly baseUrl = computed<string>(() => {
    if (!this.enabled()) {
      return environment.publicUrl;
    }

    const ip = this.ip().trim() || this.detectedIp();

    if (!ip) {
      return environment.publicUrl;
    }

    return `http://${ip}${this.port() ? `:${this.port()}` : ''}`;
  });

  setEnabled(value: boolean): void {
    this.enabled.set(value);
  }

  setIp(value: string): void {
    this.ip.set(value);
    localStorage.setItem(STORAGE_KEY, value);
  }
}