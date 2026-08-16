import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Ingredient } from './ingredients.service';

export type WarehouseMode = 'shared' | 'per_branch';

export interface StockItem {
  _id: string;
  tenantId: string;
  ingredientId: string;
  branchId: string | null;
  quantity: number;
  ingredient: Ingredient | null;
}

export interface StockAdjustmentPayload {
  tenantId: string;
  ingredientId: string;
  branchId?: string | null;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
}

export interface Movement {
  _id: string;
  tenantId: string;
  ingredientId: string;
  branchId?: string;
  quantity: number;
  type: 'entry' | 'exit' | 'sale';
  reason: string;
  orderId?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly #http = inject(HttpClient);

  getWarehouseMode(tenantId?: string): Observable<{ warehouseMode: WarehouseMode }> {
    let params = new HttpParams();

    if (tenantId) {
      params = params.set('tenantId', tenantId);
    }

    return this.#http.get<{ warehouseMode: WarehouseMode }>(
      `${environment.apiUrl}/api/inventory/mode`,
      { params }
    );
  }

  setWarehouseMode(
    warehouseMode: WarehouseMode,
    tenantId?: string
  ): Observable<{ warehouseMode: WarehouseMode }> {
    return this.#http.put<{ warehouseMode: WarehouseMode }>(
      `${environment.apiUrl}/api/inventory/mode`,
      { tenantId, warehouseMode }
    );
  }

  listStock(tenantId?: string, branchId?: string): Observable<StockItem[]> {
    let params = new HttpParams();

    if (tenantId) {
      params = params.set('tenantId', tenantId);
    }

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.#http.get<StockItem[]>(`${environment.apiUrl}/api/inventory/stock`, { params });
  }

  adjustStock(payload: StockAdjustmentPayload): Observable<StockItem> {
    return this.#http.post<StockItem>(
      `${environment.apiUrl}/api/inventory/stock/adjustments`,
      payload
    );
  }

  listMovements(tenantId?: string, ingredientId?: string): Observable<Movement[]> {
    let params = new HttpParams();

    if (tenantId) {
      params = params.set('tenantId', tenantId);
    }

    if (ingredientId) {
      params = params.set('ingredientId', ingredientId);
    }

    return this.#http.get<Movement[]>(`${environment.apiUrl}/api/inventory/movements`, { params });
  }
}
