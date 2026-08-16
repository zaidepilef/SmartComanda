import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface RecipeLine {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  _id: string;
  tenantId: string;
  name: string;
  salePrice: number;
  computedCost: number;
  recipe: RecipeLine[];
  active: boolean;
  description?: string;
}

export interface DishPayload {
  tenantId: string;
  name: string;
  salePrice: number;
  recipe: RecipeLine[];
  active: boolean;
  description?: string;
}

export interface DishUpdatePayload {
  name?: string;
  salePrice?: number;
  recipe?: RecipeLine[];
  active?: boolean;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class DishService {
  readonly #http = inject(HttpClient);

  list(tenantId?: string, q?: string): Observable<Dish[]> {
    let params = new HttpParams();

    if (tenantId) {
      params = params.set('tenantId', tenantId);
    }

    if (q && q.trim() !== '') {
      params = params.set('q', q.trim());
    }

    return this.#http.get<Dish[]>(`${environment.apiUrl}/api/dishes`, { params });
  }

  create(payload: DishPayload): Observable<Dish> {
    return this.#http.post<Dish>(`${environment.apiUrl}/api/dishes`, payload);
  }

  update(id: string, payload: DishUpdatePayload): Observable<Dish> {
    return this.#http.put<Dish>(`${environment.apiUrl}/api/dishes/${id}`, payload);
  }
}
