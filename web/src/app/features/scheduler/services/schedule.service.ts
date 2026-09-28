import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../core/services/auth.service';

import {
  RunNowResponse,
  Schedule,
  SchedulePayload
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/schedules`;

  list(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.baseUrl);
  }

  create(payload: SchedulePayload): Observable<Schedule> {
    return this.http.post<Schedule>(this.baseUrl, payload);
  }

  update(
    id: string,
    payload: SchedulePayload
  ): Observable<Schedule> {
    return this.http.patch<Schedule>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  toggleStatus(id: string): Observable<Schedule> {
    return this.http.patch<Schedule>(
      `${this.baseUrl}/${id}/toggle_status`,
      {}
    );
  }

  runNow(id: string): Observable<RunNowResponse> {
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }

        return this.http.post<RunNowResponse>(
          `${this.baseUrl}/${id}/run_now`,
          {},
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
        );
      })
    );
  }
}
