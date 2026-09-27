import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  CompanyGroup,
  CompanyGroupPayload
} from '../models/company-group.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyGroupService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/v1/company_groups`;

  list(): Observable<CompanyGroup[]> {
    return this.http.get<CompanyGroup[]>(
      this.baseUrl
    );
  }

  get(id: string): Observable<CompanyGroup> {
    return this.http.get<CompanyGroup>(
      `${this.baseUrl}/${id}`
    );
  }

  create(
    payload: CompanyGroupPayload
  ): Observable<CompanyGroup> {
    return this.http.post<CompanyGroup>(
      this.baseUrl,
      payload
    );
  }

  update(
    id: string,
    payload: CompanyGroupPayload
  ): Observable<CompanyGroup> {
    return this.http.patch<CompanyGroup>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }
}