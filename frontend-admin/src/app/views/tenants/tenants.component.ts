import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

export class TenantsComponent implements OnInit {
  readonly #tenantService = inject(TenantService);
  readonly #router = inject(Router);

  readonly tenants = signal<Tenant[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly saving = signal(false);
  readonly creating = signal(false);

  editing: Tenant | null = null;
  newTenant: TenantForm = { ...EMPTY_FORM };

  ngOnInit(): void {
    this.#load();
  }

  #load(): void {
    this.loading.set(true);
    this.error.set('');

    this.#tenantService.list().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los tenants.');
      }
    });
  }

  startCreate(): void {
    this.newTenant = { ...EMPTY_FORM };
    this.creating.set(true);
    this.error.set('');
  }

  cancelCreate(): void {
    this.creating.set(false);
  }

  saveCreate(): void {
    this.saving.set(true);
    this.error.set('');

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
          this.saving.set(false);
          this.creating.set(false);
          this.#load();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.error ?? 'No se pudo crear el tenant.');
        }
      });
  }

  startEdit(tenant: Tenant): void {
    this.editing = { ...tenant };
  }

  openBranches(tenant: Tenant): void {
    void this.#router.navigate(['/branches'], { queryParams: { tenantId: tenant._id } });
  }

  cancelEdit(): void {
    this.editing = null;
  }

  saveEdit(): void {
    if (!this.editing) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

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
          this.saving.set(false);
          this.editing = null;
          this.#load();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.error ?? 'No se pudo guardar el tenant.');
        }
      });
  }
}
