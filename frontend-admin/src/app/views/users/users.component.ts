import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { User, UserService, UserStatus } from './user.service';

const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
};

const STATUS_BADGES: Record<UserStatus, string> = {
  pending: 'text-bg-warning',
  active: 'text-bg-success',
  inactive: 'text-bg-secondary',
};

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent {
  readonly #userService = inject(UserService);

  users: User[] = [];
  statusFilter = 'pending';
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  loading = false;
  error = '';
  editing: User | null = null;
  saving = false;

  constructor() {
    this.#load();
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

  saveEdit(): void {
    if (!this.editing) {
      return;
    }

    this.saving = true;
    this.error = '';

    const { _id, firstName, lastName, email, status } = this.editing;

    this.#userService.update(_id, { firstName, lastName, email, status }).subscribe({
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