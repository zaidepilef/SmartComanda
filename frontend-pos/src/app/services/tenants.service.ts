import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly #http = inject(HttpClient);

  listAll(): Observable<Tenant[]> {
    return this.#http.get<Tenant[]>(`${environment.apiUrl}/api/tenants`);
  }
}