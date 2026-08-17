import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PosModal } from '../../components/pos-modal/pos-modal';
import { ToastService } from '../../components/toast/toast.service';
import { Branch } from '../../services/branches.service';
import {
  CashSessionService,
  CashSession,
} from '../../services/cash-sessions.service';
import { Dish, DishService } from '../../services/dishes.service';
import {
  CreateOrderResponse,
  OrderService,
  OrderType,
  PaymentMethod,
  ORDER_TYPE_LABELS,
} from '../../services/orders.service';
import { PAYMENT_METHOD_LABELS } from '../../services/branches.service';
import { PosStore } from '../../store/pos-store.service';

interface CartItem {
  dish: Dish;
  quantity: number;
  note: string;
}

interface ItemModalState {
  dish: Dish;
  quantity: number;
  note: string;
}

const formatCLP = (value: number): string =>
  `$${Math.round(value).toLocaleString('es-CL')}`;

@Component({
  selector: 'app-pos',
  imports: [FormsModule, PosModal],
  templateUrl: './pos.html',
  styleUrls: ['./pos.scss'],
})
export class PosView implements OnInit {
  readonly #dishService = inject(DishService);
  readonly #orderService = inject(OrderService);
  readonly #cashSessionService = inject(CashSessionService);
  readonly #store = inject(PosStore);
  readonly #toast = inject(ToastService);
  readonly #router = inject(Router);

  readonly branch = this.#store.branch;
  readonly cashSession = this.#store.cashSession;

  dishes: Dish[] = [];
  loading = true;
  error = '';

  categories: string[] = [];
  activeCategory = '';

  search = '';
  cart: CartItem[] = [];

  itemModal: ItemModalState | null = null;
  orderModalOpen = false;
  paymentModalOpen = false;

readonly orderTypes: OrderType[] = ['takeaway', 'dinein', 'delivery', 'qr'];

  clientContact = '';
  orderType: OrderType = 'takeaway';

  paymentMethod: PaymentMethod | null = null;
  cashReceived: number | null = null;

  submitting = false;
  lastOrder: CreateOrderResponse | null = null;

  get branchId(): string {
    return this.#store.branch()?._id ?? '';
  }

  ngOnInit(): void {
    this.#loadDishes();
    this.#loadCashSession();
  }

  #loadDishes(): void {
    this.loading = true;
    this.error = '';

    this.#dishService.list(this.#store.tenant()?._id, undefined, this.branchId).subscribe({
      next: (dishes) => {
        this.dishes = dishes.filter((dish) => dish.active);
        this.categories = Array.from(
          new Set(this.dishes.map((dish) => dish.category || 'general'))
        );

        if (!this.categories.includes(this.activeCategory)) {
          this.activeCategory = this.categories[0] ?? '';
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los platos.';
      },
    });
  }

  #loadCashSession(): void {
    this.#cashSessionService.current(this.branchId).subscribe({
      next: (session) => this.#store.setCashSession(session),
      error: (err) => {
        if (err.status === 404) {
          this.#store.setCashSession(null);
        }
      },
    });
  }

  visibleDishes(): Dish[] {
    const query = this.search.trim().toLowerCase();

    return this.dishes.filter((dish) => {
      const inCategory = !this.activeCategory || dish.category === this.activeCategory;
      const matches = !query || dish.name.toLowerCase().includes(query);

      return inCategory && matches;
    });
  }

  categoryIcon(category: string): string {
    const dish = this.dishes.find((item) => item.category === category);

    return dish?.icon || '🍽️';
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
  }

  onSearchChange(value: string): void {
    this.search = value;
  }

  priceOf(dish: Dish): number {
    return this.#dishService.priceOf(dish, this.branchId);
  }

  openItemModal(dish: Dish): void {
    this.itemModal = { dish, quantity: 1, note: '' };
  }

  closeItemModal(): void {
    this.itemModal = null;
  }

  addToCart(): void {
    const modal = this.itemModal;

    if (!modal || modal.quantity <= 0) {
      return;
    }

    const existing = this.cart.find((item) => item.dish._id === modal.dish._id);

    if (existing) {
      existing.quantity += modal.quantity;
      existing.note = existing.note || modal.note.trim();
    } else {
      this.cart.push({ dish: modal.dish, quantity: modal.quantity, note: modal.note.trim() });
    }

    this.itemModal = null;
  }

  decreaseItemQuantity(): void {
    if (this.itemModal) {
      this.itemModal.quantity = Math.max(1, this.itemModal.quantity - 1);
    }
  }

  increaseItemQuantity(): void {
    if (this.itemModal) {
      this.itemModal.quantity += 1;
    }
  }

  changeQuantity(item: CartItem, delta: number): void {
    item.quantity += delta;

    if (item.quantity <= 0) {
      this.cart = this.cart.filter((entry) => entry !== item);
    }
  }

  editNote(item: CartItem): void {
    const note = prompt('Observación para el plato:', item.note || '');

    if (note !== null) {
      item.note = note.trim();
    }
  }

  removeItem(item: CartItem): void {
    this.cart = this.cart.filter((entry) => entry !== item);
  }

  clearCart(): void {
    this.cart = [];
  }

  subtotal(): number {
    return this.cart.reduce(
      (sum, item) => sum + this.priceOf(item.dish) * item.quantity,
      0
    );
  }

  total(): number {
    return this.subtotal();
  }

  formatCLP(value: number): string {
    return formatCLP(value);
  }

  canCharge(): boolean {
    return this.cart.length > 0 && this.cashSession() !== null && !this.submitting;
  }

  openOrderModal(): void {
    this.clientContact = '';
    this.orderType = 'takeaway';
    this.orderModalOpen = true;
  }

  closeOrderModal(): void {
    this.orderModalOpen = false;
  }

  openPaymentModal(): void {
    this.orderModalOpen = false;
    this.paymentMethod = null;
    this.cashReceived = null;
    this.paymentModalOpen = true;
  }

  closePaymentModal(): void {
    this.paymentModalOpen = false;
  }

  branchPaymentMethods(): PaymentMethod[] {
    const branch = this.#store.branch();

    return branch?.paymentMethods?.length ? branch.paymentMethods : ['cash'];
  }

  paymentLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] ?? method;
  }

  orderTypeLabel(type: OrderType): string {
    return ORDER_TYPE_LABELS[type] ?? type;
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.paymentMethod = method;
    this.cashReceived = null;
  }

  cashChange(): number {
    const received = this.cashReceived ?? 0;

    return Math.max(0, received - this.total());
  }

  canConfirmPayment(): boolean {
    if (!this.paymentMethod) {
      return false;
    }

    if (this.paymentMethod === 'cash') {
      return (this.cashReceived ?? 0) >= this.total();
    }

    return true;
  }

  submitOrder(): void {
    const method = this.paymentMethod;

    if (!method || !this.canConfirmPayment()) {
      return;
    }

    this.submitting = true;

    this.#orderService
      .create({
        foodtruckId: this.branchId,
        clientContact: this.clientContact.trim() || undefined,
        orderType: this.orderType,
        paymentMethod: method,
        items: this.cart.map((item) => ({
          dishId: item.dish._id,
          quantity: item.quantity,
          note: item.note || undefined,
          stockApplied: true,
        })),
      })
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.paymentModalOpen = false;
          this.lastOrder = response;
          this.cart = [];
          this.#loadCashSession();

          if (response.warnings.length > 0) {
            this.#toast.error(
              `Pedido #${response.order.number} creado con advertencias de stock.`
            );
          } else {
            this.#toast.ok(`Pedido #${response.order.number} cobrado correctamente.`);
          }
        },
        error: (err) => {
          this.submitting = false;

          if (err.status === 409) {
            this.paymentModalOpen = false;
            this.#store.setCashSession(null);
            this.#toast.error('No hay una caja abierta para esta sucursal.');
            void this.#router.navigate(['/cash']);
            return;
          }

          this.#toast.error(err.error?.error ?? 'No se pudo crear el pedido.');
        },
      });
  }

  dismissLastOrder(): void {
    this.lastOrder = null;
  }

  goToCaja(): void {
    void this.#router.navigate(['/cash']);
  }
}