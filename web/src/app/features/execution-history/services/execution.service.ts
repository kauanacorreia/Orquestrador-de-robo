import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  Execution,
  ExecutionFilters,
  ExecutionListResponse,
  ExecutionLogEntry
} from '../models/execution.model';

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/executions`;

  list(
    filters: ExecutionFilters
  ): Observable<ExecutionListResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ExecutionListResponse>(this.baseUrl, {
      params
    });
  }

  get(id: string): Observable<Execution> {
    return this.http.get<Execution>(`${this.baseUrl}/${id}`);
  }

  logs(id: string): Observable<ExecutionLogEntry[]> {
    return this.http.get<ExecutionLogEntry[]>(
      `${this.baseUrl}/${id}/logs`
    );
  }
}
