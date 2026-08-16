import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface OrderItemInput {
  dishId: string;
  quantity: number;
  stockApplied: boolean;
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  stockApplied: boolean;
}

export interface Order {
  _id: string;
  tenantId: string;
  foodtruckId: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface MissingIngredient {
  ingredientId: string;
  ingredientName: string;
  available: number;
  needed: number;
}

export interface OrderWarning {
  itemIndex: number;
  dishId: string;
  dishName: string;
  missing: MissingIngredient[];
}

export interface CreateOrderResult {
  order: Order;
  warnings: OrderWarning[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  readonly #http = inject(HttpClient);

  create(payload: {
    foodtruckId: string;
    clientContact?: string;
    items: OrderItemInput[];
  }): Observable<CreateOrderResult> {
    return this.#http.post<CreateOrderResult>(`${environment.apiUrl}/api/orders`, payload);
  }
}
