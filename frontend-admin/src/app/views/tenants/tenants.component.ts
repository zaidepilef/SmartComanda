import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Tenant, TenantService } from '../../services/tenants.service';

interface TenantForm {
  name: string;
  rut: string;
  razonSocial: string;
  active: boolean;
}

const EMPTY_FORM: TenantForm = {
  name: '',
  rut: '',
  razonSocial: '',
  active: true,
};

@Component({
  selector: 'app-tenants',
  imports: [FormsModule],
  templateUrl: './tenants.component.html'
})
export class TenantsComponent {
  readonly #tenantService = inject(TenantService);

  tenants: Tenant[] = [];
  loading = false;
  error = '';
  editing: Tenant | null = null;
  creating = false;
  newTenant: TenantForm = { ...EMPTY_FORM };
  saving = false;

  constructor() {
    this.#load();
  }

  #load(): void {
    this.loading = true;
    this.error = '';

    this.#tenantService.list(false).subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los tenants.';
      }
    });
  }

  startCreate(): void {
    this.newTenant = { ...EMPTY_FORM };
    this.creating = true;
    this.error = '';
  }

  cancelCreate(): void {
    this.creating = false;
  }

  saveCreate(): void {
    this.saving = true;
    this.error = '';

    const { name, rut, razonSocial, active } = this.newTenant;

    this.#tenantService
      .create({
        name,
        rut: rut || undefined,
        razonSocial: razonSocial || undefined,
        active,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.creating = false;
          this.#load();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.error ?? 'No se pudo crear el tenant.';
        }
      });
  }

  startEdit(tenant: Tenant): void {
    this.editing = { ...tenant };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  saveEdit(): void {
    if (!this.editing) {
      return;
    }

    this.saving = true;
    this.error = '';

    const { _id, name, rut, razonSocial, active } = this.editing;

    this.#tenantService
      .update(_id, {
        name,
        rut: rut || undefined,
        razonSocial: razonSocial || undefined,
        active,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.editing = null;
          this.#load();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.error ?? 'No se pudo guardar el tenant.';
        }
      });
  }
}