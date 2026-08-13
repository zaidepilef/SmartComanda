import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: UserStatus;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  readonly #http = inject(HttpClient);

  list(params: { page?: number; limit?: number; status?: string }): Observable<UserListResponse> {
    const httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 10))
      .set('status', params.status ?? '');

    return this.#http.get<UserListResponse>(`${environment.apiUrl}/api/users`, {
      params: httpParams,
    });
  }

  update(id: string, payload: UserUpdatePayload): Observable<User> {
    return this.#http.put<User>(`${environment.apiUrl}/api/users/${id}`, payload);
  }
}