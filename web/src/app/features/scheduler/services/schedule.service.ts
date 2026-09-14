import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

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
    return this.http.post<RunNowResponse>(
      `${this.baseUrl}/${id}/run_now`,
      {}
    );
  }
}
