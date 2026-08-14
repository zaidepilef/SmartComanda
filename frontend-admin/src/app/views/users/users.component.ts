import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CREATABLE_ROLES, User, UserRole, UserService, UserStatus } from './user.service';
import { Tenant, TenantService } from '../../services/tenants.service';

const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
};

const STATUS_BADGES: Record<UserStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
};

const ROLE_LABELS: Record<UserRole, string> = {
  sysadmin: 'Sysadmin',
  owner: 'Owner',
  admin: 'Admin',
  cashier: 'Cajero',
};

const ROLE_BADGES: Record<UserRole, string> = {
  sysadmin: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
  owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  admin: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  cashier: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
};

interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  role: Exclude<UserRole, 'sysadmin'>;
  tenantId: string;
}

const EMPTY_NEW_USER: NewUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  status: 'active',
  role: 'owner',
  tenantId: '',
};

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent  implements OnInit {
  readonly #userService = inject(UserService);
  readonly #tenantService = inject(TenantService);

  users: User[] = [];
  statusFilter = '';
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  loading = false;
  error = '';
  editing: User | null = null;
  saving = false;
  creating = false;
  newUser: NewUserForm = { ...EMPTY_NEW_USER };
  tenants: Tenant[] = [];
  creatableRoles = CREATABLE_ROLES;

  constructor() {
  }

  ngOnInit(): void {
    this.#load();
    //this.#loadTenants();
  }

  #load(): void {
    this.loading = true;
    this.error = '';

    this.#userService
      .list({ page: this.page, limit: this.limit, status: this.statusFilter })
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.total = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'No se pudieron cargar los usuarios.';
        }
      });
  }

  label(status: UserStatus): string {
    return STATUS_LABELS[status];
  }

  badge(status: UserStatus): string {
    return STATUS_BADGES[status];
  }

  roleLabel(role: UserRole | undefined): string {
    return role ? ROLE_LABELS[role] : '—';
  }

  roleBadge(role: UserRole | undefined): string {
    return role ? ROLE_BADGES[role] : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
  }

  #loadTenants(): void {
    this.#tenantService.list().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
      }
    });
  }

  applyFilter(): void {
    this.page = 1;
    this.#load();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.#load();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page += 1;
      this.#load();
    }
  }

  approve(user: User): void {
    this.#setStatus(user, 'active');
  }

  reject(user: User): void {
    this.#setStatus(user, 'inactive');
  }

  #setStatus(user: User, status: UserStatus): void {
    this.error = '';

    this.#userService.update(user._id, { status }).subscribe({
      next: () => this.#load(),
      error: (err) => {
        this.error = err.error?.error ?? 'No se pudo actualizar el usuario.';
      }
    });
  }

  startEdit(user: User): void {
    this.editing = { ...user };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  startCreate(): void {
    this.newUser = { ...EMPTY_NEW_USER };
    this.creating = true;
    this.error = '';
  }

  cancelCreate(): void {
    this.creating = false;
  }

  saveCreate(): void {
    this.saving = true;
    this.error = '';

    const { firstName, lastName, email, password, status, role, tenantId } = this.newUser;

    this.#userService
      .create({
        firstName,
        lastName,
        email,
        password,
        status,
        role,
        tenantId: tenantId || undefined,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.creating = false;
          this.#load();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.error ?? 'No se pudo crear el usuario.';
        }
      });
  }

  saveEdit(): void {
    if (!this.editing) {
      return;
    }

    this.saving = true;
    this.error = '';

    const { _id, firstName, lastName, email, status, role, tenantId } = this.editing;

    const payload = { firstName, lastName, email, status };

    if (role) {
      (payload as { role?: UserRole }).role = role;
    }

    if (tenantId) {
      (payload as { tenantId?: string }).tenantId = tenantId;
    }

    this.#userService.update(_id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.editing = null;
        this.#load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.error ?? 'No se pudo guardar el usuario.';
      }
    });
  }
}