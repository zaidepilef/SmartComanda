import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { Tenant, TenantService } from '../../services/tenants.service';
import { Branch, BranchService } from '../../services/branches.service';
import {
  InventoryService,
  Movement,
  StockItem,
  WarehouseMode,
} from '../../services/inventory.service';
import { Ingredient, IngredientService } from '../../services/ingredients.service';

interface AdjustmentForm {
  tenantId: string;
  ingredientId: string;
  branchId: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
}

const EMPTY_FORM: AdjustmentForm = {
  tenantId: '',
  ingredientId: '',
  branchId: '',
  type: 'entry',
  quantity: 1,
  reason: '',
};

@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {
  readonly #inventoryService = inject(InventoryService);
  readonly #ingredientService = inject(IngredientService);
  readonly #tenantService = inject(TenantService);
  readonly #branchService = inject(BranchService);
  readonly #authService = inject(AuthService);

  readonly tenants = signal<Tenant[]>([]);
  readonly ingredients = signal<Ingredient[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly stock = signal<StockItem[]>([]);
  readonly movements = signal<Movement[]>([]);
  readonly selectedTenantId = signal<string>('');
  readonly selectedBranchId = signal<string>('');
  readonly warehouseMode = signal<WarehouseMode>('shared');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly saving = signal(false);
  readonly showAdjustment = signal(false);

  readonly isSysadmin = this.#authService.user()?.role === 'sysadmin';
  readonly isOwner = ['sysadmin', 'owner'].includes(this.#authService.user()?.role ?? '');

  adjustment: AdjustmentForm = { ...EMPTY_FORM };

  ngOnInit(): void {
    this.#loadTenants();
    this.#loadIngredients();
    this.#loadBranches();
    this.#loadMode();
    this.#loadStock();
    this.#loadMovements();
  }

  onTenantChange(tenantId: string): void {
    this.selectedTenantId.set(tenantId);
    this.selectedBranchId.set('');
    this.#loadBranches();
    this.#loadMode();
    this.#loadStock();
    this.#loadMovements();
  }

  onBranchChange(branchId: string): void {
    this.selectedBranchId.set(branchId);
    this.#loadStock();
  }

  #loadTenants(): void {
    this.#tenantService.listAll().subscribe({
      next: (tenants) => this.tenants.set(tenants),
      error: () => this.error.set('No se pudieron cargar los tenants.'),
    });
  }

  #loadIngredients(): void {
    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;
    this.#ingredientService.list(tenantId).subscribe({
      next: (ingredients) => this.ingredients.set(ingredients),
    });
  }

  #loadBranches(): void {
    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;
    this.#branchService.list(tenantId, undefined, 'true').subscribe({
      next: (branches) => this.branches.set(branches),
    });
  }

  #loadMode(): void {
    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;
    this.#inventoryService.getWarehouseMode(tenantId).subscribe({
      next: ({ warehouseMode }) => this.warehouseMode.set(warehouseMode),
      error: (err) => this.error.set(err.error?.error ?? 'No se pudo cargar el modo de bodega.'),
    });
  }

  #loadStock(): void {
    this.loading.set(true);
    this.error.set('');

    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;
    const branchId =
      this.warehouseMode() === 'per_branch' ? this.selectedBranchId() || undefined : undefined;

    this.#inventoryService.listStock(tenantId, branchId).subscribe({
      next: (stock) => {
        this.stock.set(stock);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error ?? 'No se pudo cargar el stock.');
      },
    });
  }

  #loadMovements(): void {
    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;
    this.#inventoryService.listMovements(tenantId).subscribe({
      next: (movements) => this.movements.set(movements),
    });
  }

  tenantName(tenantId: string): string {
    return this.tenants().find((t) => t._id === tenantId)?.name ?? '—';
  }

  ingredientName(ingredientId: string): string {
    return this.ingredients().find((i) => i._id === ingredientId)?.name ?? '—';
  }

  branchName(branchId: string | null | undefined): string {
    if (!branchId) {
      return 'Bodega central';
    }
    return this.branches().find((b) => b._id === branchId)?.name ?? '—';
  }

  formatQuantity(value: number): string {
    return value.toLocaleString('es-CL');
  }

  movementDate(date: string): string {
    return new Date(date).toLocaleString('es-CL');
  }

  modeLabel(mode: WarehouseMode): string {
    return mode === 'shared' ? 'Bodega compartida' : 'Bodega por sucursal';
  }

  setMode(mode: WarehouseMode): void {
    if (mode === this.warehouseMode()) {
      return;
    }

    const tenantId = this.isSysadmin ? this.selectedTenantId() || undefined : undefined;

    if (!tenantId && !this.isSysadmin) {
      this.error.set('No se pudo identificar el tenant.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.#inventoryService.setWarehouseMode(mode, tenantId).subscribe({
      next: ({ warehouseMode }) => {
        this.warehouseMode.set(warehouseMode);
        this.saving.set(false);
        this.success.set('Modo de bodega actualizado.');
        this.#loadStock();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err.error?.error ?? 'No se pudo cambiar el modo de bodega.'
        );
      },
    });
  }

  startAdjustment(): void {
    this.adjustment = {
      ...EMPTY_FORM,
      tenantId: this.isSysadmin
        ? this.selectedTenantId()
        : this.#authService.user()?.tenantId ?? '',
    };
    this.showAdjustment.set(true);
    this.error.set('');
    this.success.set('');
  }

  cancelAdjustment(): void {
    this.showAdjustment.set(false);
  }

  saveAdjustment(): void {
    if (!this.adjustment.tenantId) {
      this.error.set('Selecciona un tenant.');
      return;
    }

    if (!this.adjustment.ingredientId) {
      this.error.set('Selecciona un ingrediente.');
      return;
    }

    if (this.warehouseMode() === 'per_branch' && !this.adjustment.branchId) {
      this.error.set('En modo por sucursal debes elegir la sucursal.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const { tenantId, ingredientId, type, quantity, reason } = this.adjustment;
    const branchId = this.warehouseMode() === 'per_branch' ? this.adjustment.branchId : null;

    this.#inventoryService
      .adjustStock({ tenantId, ingredientId, branchId, type, quantity, reason })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showAdjustment.set(false);
          this.success.set('Ajuste de stock registrado.');
          this.#loadStock();
          this.#loadMovements();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.error ?? 'No se pudo registrar el ajuste.');
        },
      });
  }

  movementLabel(type: Movement['type']): string {
    const labels: Record<Movement['type'], string> = {
      entry: 'Entrada',
      exit: 'Salida',
      sale: 'Venta',
    };
    return labels[type] ?? type;
  }

  movementBadge(type: Movement['type']): string {
    const badges: Record<Movement['type'], string> = {
      entry: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
      exit: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
      sale: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    };
    return badges[type] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
  }
}
