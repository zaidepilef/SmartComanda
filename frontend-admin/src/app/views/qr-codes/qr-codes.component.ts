import { Component, effect, inject, OnInit, signal } from '@angular/core';
import QRCode from 'qrcode';

import { LanUrlService } from '../../services/lan-url.service';
import { Branch, BranchService } from '../../services/branches.service';
import { Tenant, TenantService } from '../../services/tenants.service';
import { LanUrlToggleComponent } from '../../components/lan-url-toggle/lan-url-toggle.component';

interface QrEntry {
  branch: Branch;
  tenantName: string;
  url: string;
  dataUrl: string;
}

@Component({
  selector: 'app-qr-codes',
  imports: [LanUrlToggleComponent],
  templateUrl: './qr-codes.component.html'
})
export class QrCodesComponent implements OnInit {
  readonly #branchService = inject(BranchService);
  readonly #tenantsService = inject(TenantService);
  readonly #lanUrl = inject(LanUrlService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly entries = signal<QrEntry[]>([]);
  readonly copiedId = signal<string | null>(null);
  readonly printingId = signal<string | null>(null);

  #loadedOnce = false;

  constructor() {
    effect(() => {
      this.#lanUrl.baseUrl();

      if (this.#loadedOnce) {
        this.entries.set([]);
        void this.#load();
      }
    });
  }

  ngOnInit(): void {
    window.addEventListener('afterprint', () => this.printingId.set(null));
    void this.#load();
  }

  #load(): void {
    this.loading.set(true);
    this.error.set('');

    this.#tenantsService.list().subscribe({
      next: (tenants) => void this.#loadTenantQrs(tenants),
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los tenants.');
      }
    });
  }

  #loadTenantQrs(tenants: Tenant[]): void {
    const tasks: Promise<void>[] = tenants.map(
      (tenant) =>
        new Promise<void>((resolve) => {
          this.#branchService.list(tenant._id, undefined, 'true').subscribe({
            next: (branches) => {
              this.#generateQrs(tenant, branches).finally(() => resolve());
            },
            error: () => resolve()
          });
        })
    );

    Promise.all(tasks).then(() => {
      this.loading.set(false);
      this.#loadedOnce = true;
    });
  }

  async #generateQrs(tenant: Tenant, branches: Branch[]): Promise<void> {
    for (const branch of branches) {
      const url = `${this.#lanUrl.baseUrl()}/q/${branch.tenantId}/${branch._id}`;

      try {
        const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1 });
        this.entries.update((list) => [...list, { branch, tenantName: tenant.name, url, dataUrl }]);
      } catch {
        // Se omite la sucursal si el QR no puede generarse.
      }
    }
  }

  copyUrl(entry: QrEntry): void {
    this.copiedId.set(null);

    void navigator.clipboard.writeText(entry.url).then(() => {
      this.copiedId.set(entry.branch._id);
      window.setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  printCard(entry: QrEntry): void {
    this.printingId.set(entry.branch._id);
    window.requestAnimationFrame(() => window.print());
  }
}