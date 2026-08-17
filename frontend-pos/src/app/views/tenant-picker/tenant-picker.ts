import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BranchFlowService } from '../../services/branch-flow.service';
import { AuthService } from '../../services/auth.service';
import { Tenant, TenantService } from '../../services/tenants.service';
import { PosStore } from '../../store/pos-store.service';

@Component({
  selector: 'app-tenant-picker',
  imports: [],
  templateUrl: './tenant-picker.html',
  styleUrls: ['./tenant-picker.scss'],
})
export class TenantPicker {
  readonly #tenantService = inject(TenantService);
  readonly #flow = inject(BranchFlowService);
  readonly #store = inject(PosStore);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  tenants: Tenant[] = [];
  loading = true;
  error = '';

  constructor() {
    if (this.#authService.user()?.role !== 'sysadmin') {
      void this.#router.navigate(['/pos']);
      return;
    }

    this.#tenantService.listAll().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los negocios.';
      },
    });
  }

  choose(tenant: Tenant): void {
    this.#flow.selectTenant(tenant);
  }

  logout(): void {
    this.#authService.logout().subscribe({
      complete: () => {
        this.#authService.setToken(null);
        this.#store.clearContext();
        void this.#router.navigate(['/login']);
      },
      error: () => {
        this.#authService.setToken(null);
        this.#store.clearContext();
        void this.#router.navigate(['/login']);
      },
    });
  }
}