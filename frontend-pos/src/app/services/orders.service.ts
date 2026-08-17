import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export type OrderType = 'takeaway' | 'dinein' | 'delivery' | 'qr';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer';

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  takeaway: 'Para llevar',
  dinein: 'En el local',
  delivery: 'Delivery',
  qr: 'Código QR',
};

export interface OrderItemInput {
  dishId: string;
  quantity: number;
  note?: string;
  stockApplied: boolean;
}

export interface CreateOrderPayload {
  foodtruckId: string;
  clientContact?: string;
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  items: OrderItemInput[];
}

export interface OrderWarning {
  dishId?: string;
  message: string;
}

export interface CreateOrderResponse {
  order: {
    _id: string;
    number: number;
    orderType: OrderType;
    paymentStatus: string;
    paymentMethod?: PaymentMethod;
    total: number;
  };
  warnings: OrderWarning[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  readonly #http = inject(HttpClient);

  create(payload: CreateOrderPayload): Observable<CreateOrderResponse> {
    return this.#http.post<CreateOrderResponse>(`${environment.apiUrl}/api/orders`, payload);
  }
}