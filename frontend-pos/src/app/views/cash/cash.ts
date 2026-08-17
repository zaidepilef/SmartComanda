import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastService } from '../../components/toast/toast.service';
import { CashSession, CashSessionService } from '../../services/cash-sessions.service';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../services/branches.service';
import { PosStore } from '../../store/pos-store.service';

const formatCLP = (value: number): string =>
  `$${Math.round(value).toLocaleString('es-CL')}`;

@Component({
  selector: 'app-cash',
  imports: [FormsModule],
  templateUrl: './cash.html',
  styleUrls: ['./cash.scss'],
})
export class CashView {
  readonly #cashSessionService = inject(CashSessionService);
  readonly #store = inject(PosStore);
  readonly #toast = inject(ToastService);
  readonly #router = inject(Router);

  readonly cashSession = this.#store.cashSession;

  openingAmount: number | null = null;
  opening = false;
  error = '';

  constructor() {
    const branchId = this.#store.branch()?._id;

    if (!branchId) {
      void this.#router.navigate(['/branch-picker']);
      return;
    }

    if (this.#store.cashSession() === null) {
      this.#cashSessionService.current(branchId).subscribe({
        next: (session) => this.#store.setCashSession(session),
        error: (err) => {
          if (err.status !== 404) {
            this.error = 'No se pudo consultar la caja.';
          }
        },
      });
    }
  }

  openSession(): void {
    const branchId = this.#store.branch()?._id;

    if (!branchId || this.opening) {
      return;
    }

    const amount = this.openingAmount ?? 0;

    if (amount < 0) {
      this.error = 'El monto inicial no puede ser negativo.';
      return;
    }

    this.opening = true;
    this.error = '';

    this.#cashSessionService.open({ branchId, openingAmount: amount }).subscribe({
      next: (session) => {
        this.opening = false;
        this.#store.setCashSession(session);
        this.#toast.ok('Caja abierta correctamente.');
      },
      error: (err) => {
        this.opening = false;
        this.error = err.error?.error ?? 'No se pudo abrir la caja.';
      },
    });
  }

  totalSession(): number {
    const session = this.cashSession();

    if (!session) {
      return 0;
    }

    const totals = session.totals ?? {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
    };

    return (
      totals.cash +
      totals.debit +
      totals.credit +
      totals.transfer +
      session.openingAmount
    );
  }

  paymentTotal(method: PaymentMethod): number {
    const session = this.cashSession();

    return session?.totals?.[method] ?? 0;
  }

  paymentLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] ?? method;
  }

  branchName(): string {
    return this.#store.branch()?.name ?? 'la sucursal';
  }

  openedAtLabel(session: CashSession): string {
    return new Date(session.openedAt).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  paymentMethods(): PaymentMethod[] {
    const session = this.cashSession();

    return session ? (Object.keys(session.totals) as PaymentMethod[]) : [];
  }

  formatCLP(value: number): string {
    return formatCLP(value);
  }

  goToPos(): void {
    void this.#router.navigate(['/pos']);
  }

  logout(): void {
    this.#router.navigate(['/tenant-picker']);
  }
}